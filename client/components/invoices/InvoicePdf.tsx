import { SettingsInfoResponse } from "@/lib/queries/settings";
import { InvoicePdfData, Item } from "@/lib/types/invoice";
import { formatMoney } from "@/lib/utils/formatters";
import { numberToWords } from "@/lib/utils/numberToWords";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from "@react-pdf/renderer";

/* ================= FONT REGISTRATION ================= */

Font.register({
    family: "Mono",
    fonts: [
        { src: "/fonts/JetBrainsMono-Regular.ttf", fontWeight: 400, },
        { src: "/fonts/JetBrainsMono-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
        { src: "/fonts/JetBrainsMono-Bold.ttf", fontWeight: 700 },
    ],
})

/* ================= LAYOUT CONSTANTS ================= */

const PAGE_HEIGHT = 842; // A4
const PAGE_PADDING = 72;
const HEADER_HEIGHT = 210;
const TABLE_HEADER_HEIGHT = 28;
const ROW_HEIGHT = 66;
const FOOTER_HEIGHT = 260;

/* ================= STYLES ================= */


const styles = StyleSheet.create({
    page: {
        padding: 36,
        fontSize: 10,
        fontFamily: "Mono",
        color: "#0f172a",
    },

    bold: { fontWeight: 700 },
    muted: { fontSize: 9, color: "#475569" },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    header: { alignItems: "center", marginBottom: 14 },
    logo: { height: 56, marginBottom: 6 },
    title: { fontSize: 20, fontWeight: 700, color: "#1e3a8a" },
    companyInfo: {
        textAlign: "center",
        fontSize: 9,
        color: "#475569",
    },

    badge: {
        alignSelf: "center",
        backgroundColor: "#eef2ff",
        paddingVertical: 5,
        paddingHorizontal: 18,
        borderRadius: 16,
        fontWeight: 700,
        marginBottom: 12,
    },

    box: {
        border: "1px solid #e5e7eb",
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
        backgroundColor: "#f8fafc",
    },

    sectionTitle: {
        fontWeight: 700,
        fontSize: 10,
        textDecoration: "underline",
        marginBottom: 4,
    },

    /* ================= TABLE ================= */

    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f1f5f9",
        borderBottom: "1px solid #cbd5f5",
        paddingVertical: 6,
        fontWeight: 700,
    },

    row: {
        flexDirection: "row",
        paddingVertical: 6,
        borderBottom: "1px solid #e5e7eb",
        wrap: false,
    },

    altRow: { backgroundColor: "#fafafa" },

    cellSl: { width: 28, textAlign: "center" },
    cellDesc: { width: 190, paddingRight: 4 },
    cellClass: { width: 45, textAlign: "center" },
    cellCompany: { width: 110, paddingRight: 4 },
    cellQty: { width: 40, textAlign: "center" },

    cellRate: {
        width: 75,
        textAlign: "right",
        fontFamily: "Mono",
        fontSize: 9,
        whiteSpace: "nowrap",
        fontWeight: 600,
    },

    cellNet: {
        width: 90,
        textAlign: "right",
        fontFamily: "Mono",
        fontSize: 9,
        whiteSpace: "nowrap",
        fontWeight: 600,
    },

    cellDiscPct: {
        width: 45,
        textAlign: "center",
        fontSize: 9,
    },

    continued: {
        marginTop: 8,
        textAlign: "right",
        fontSize: 9,
        fontStyle: "italic",
        color: "#475569",
    },

    footerBlock: { marginTop: 12 },

    totalsBox: {
        width: 240,
        alignSelf: "flex-end",
        border: "1px solid #c7d2fe",
        padding: 10,
        borderRadius: 6,
        backgroundColor: "#eef2ff",
    },

    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    totalBold: {
        fontWeight: 700,
        borderTop: "1px solid #818cf8",
        paddingTop: 6,
        marginTop: 6,
    },

    amountWords: {
        marginTop: 10,
        padding: 8,
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        fontSize: 9,
        fontStyle: "italic",
        backgroundColor: "#f9fafb",
    },

    twoCol: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 14,
        gap: 10,
    },

    bankBox: {
        width: 300,
        border: "1px solid #e5e7eb",
        padding: 10,
        borderRadius: 6,
    },

    qrBox: {
        width: 120,
        border: "1px solid #e5e7eb",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
    },

    qr: { width: 90, height: 90, marginTop: 6 },

    billedBy: {
        marginTop: 16,
        alignSelf: "flex-end",
        textAlign: "right",
    },

    footer: {
        marginTop: 16,
        textAlign: "center",
        fontSize: 9,
        color: "#64748b",
    },

    watermark: {
        position: "absolute",
        top: "40%",
        left: "8%",
        width: "100%",
        textAlign: "center",
        fontSize: 90,
        fontWeight: 800,
        color: "#dc262620",
        transform: "rotate(-30deg)",
        letterSpacing: 6,
    },

    statusRibbon: {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        textAlign: "center",
        alignSelf: "center",
    },
})


/* ================= DYNAMIC PAGINATION ================= */

function paginate(items: Item[]) {
    const pages: any[][] = [];
    let current: Item[] = [];
    let usedHeight = HEADER_HEIGHT + TABLE_HEADER_HEIGHT;

    items.forEach((item, idx) => {
        const isLastItem = idx === items.length - 1;
        const footerReserve = isLastItem ? FOOTER_HEIGHT : 0;

        if (
            usedHeight + ROW_HEIGHT + footerReserve >
            PAGE_HEIGHT - PAGE_PADDING
        ) {
            pages.push(current);
            current = [];
            usedHeight = TABLE_HEADER_HEIGHT;
        }

        current.push(item);
        usedHeight += ROW_HEIGHT;
    });

    if (current.length) pages.push(current);
    return pages;
}

/* ================= PDF ================= */

export default function InvoicePdf({ data, settings }: { data: InvoicePdfData, settings: SettingsInfoResponse }) {

    const pages = paginate(data.items);
    const totalPages = pages.length;

    return (
        <Document>
            {pages.map((pageRows, pageIndex) => {
                const isLast = pageIndex === totalPages - 1;

                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>

                        {data.status === "VOIDED" && (
                            <Text style={styles.watermark}>
                                VOIDED
                            </Text>
                        )}
                        {/* HEADER */}
                        <View style={styles.rowBetween}>
                            <Text>{String(data.kind).toLowerCase() + " no: "}{data.documentNo}</Text>
                            <View>
                                <Text>{new Date(data.date).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })}
                                </Text>
                                {totalPages > 1 && <Text>
                                    Page {pageIndex + 1} / {totalPages}
                                </Text>}

                                {data.status === "VOIDED" && (
                                    <View style={{ width: "100%", marginTop: 6 }}>
                                        <Text style={styles.statusRibbon}>
                                            VOIDED
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.header}>
                            {settings?.logoUrl && (
                                <Image
                                    src={'/api' + settings.logoUrl}
                                    style={styles.logo}
                                />
                            )}

                            <Text style={styles.title}>
                                {settings?.name?.toUpperCase()}
                            </Text>

                            {/* Address */}
                            {(settings?.street ||
                                settings?.town ||
                                settings?.district ||
                                settings?.state ||
                                settings?.pincode) && (
                                    <Text style={styles.companyInfo}>
                                        {[
                                            settings.street,
                                            settings.town,
                                            settings.district,
                                            settings.state,
                                            settings.pincode,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </Text>
                                )}

                            {/* Contact */}
                            <Text style={styles.companyInfo}>
                                Phone: {settings?.phone}
                                {settings?.phoneSecondary && `, ${settings.phoneSecondary}`}
                                {settings?.phoneTertiary && `, ${settings.phoneTertiary}`}
                            </Text>

                            {/* Email */}
                            {settings?.email && (
                                <Text style={styles.companyInfo}>
                                    Email: {settings.email}
                                </Text>
                            )}

                            {/* GST */}
                            {settings?.gst && (
                                <Text style={styles.companyInfo}>
                                    GSTIN: {settings.gst}
                                </Text>
                            )}
                        </View>



                        <Text style={styles.badge}>{String(data.kind) === "INVOICE" ? "BILL OF SUPPLY" : data.kind}</Text>

                        {pageIndex === 0 && (
                            <View style={styles.box}>
                                <Text style={styles.sectionTitle}>
                                    {String(data.kind) === "INVOICE" ? "BILL TO" : "TO"}
                                </Text>

                                <Text style={styles.bold}>
                                    {data.school.name}
                                </Text>

                                {data.school.contactPerson && (
                                    <Text>
                                        Attn: {data.school.contactPerson}
                                    </Text>
                                )}

                                {(data.school.street ||
                                    data.school.town ||
                                    data.school.district ||
                                    data.school.state ||
                                    data.school.pincode) && (
                                        <Text>
                                            {[
                                                data.school.street,
                                                data.school.town,
                                                data.school.district,
                                                data.school.state,
                                                data.school.pincode,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </Text>
                                    )}

                                <Text>
                                    Phone: {data.school.phone}
                                </Text>

                                {data.school.email && (
                                    <Text>
                                        Email: {data.school.email}
                                    </Text>
                                )}

                                {data.school.gst && (
                                    <Text>
                                        GSTIN: {data.school.gst}
                                    </Text>
                                )}
                            </View>
                        )}


                        {/* TABLE HEADER */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.cellSl}>#</Text>
                            <Text style={styles.cellDesc}>Description</Text>
                            <Text style={styles.cellClass}>Class</Text>
                            <Text style={styles.cellCompany}>Company</Text>
                            <Text style={styles.cellQty}>Qty</Text>
                            <Text style={styles.cellRate}>Rate</Text>
                            <Text style={styles.cellDiscPct}>Disc%</Text>
                            <Text style={styles.cellNet}>Total</Text>
                        </View>



                        {/* ROWS */}
                        {
                            pageRows.map((r, idx) => (
                                <View
                                    key={idx}
                                    style={idx % 2 ? [styles.row, styles.altRow] : styles.row} // change to {}
                                >
                                    <Text style={styles.cellSl}>
                                        {pageIndex * 100 + idx + 1}
                                    </Text>

                                    <Text style={styles.cellDesc}>{r.description}</Text>

                                    <Text style={styles.cellClass}>{r.class || "-"}</Text>

                                    <Text style={styles.cellCompany}>{r.company || "-"}</Text>

                                    <Text style={styles.cellQty}>{r.quantity}</Text>

                                    <Text style={styles.cellRate}>{formatMoney(r.rate)}</Text>

                                    <Text style={styles.cellDiscPct}>{r.discountPercent}%</Text>

                                    <Text style={styles.cellNet}>{formatMoney(r.netAmount)}</Text>
                                </View>

                            ))
                        }

                        {/* CONTINUED */}
                        {
                            !isLast && (
                                <Text style={styles.continued}>
                                    Continued on next page →
                                </Text>
                            )
                        }

                        {/* FOOTER (ATOMIC) */}
                        {
                            isLast && (
                                <View wrap={false} style={styles.footerBlock}>
                                    <View style={styles.totalsBox}>
                                        <View style={styles.totalRow}>
                                            <Text>Total Quantity</Text>
                                            <Text>{data.totals.totalQuantity}</Text>
                                        </View>

                                        <View style={styles.totalRow}>
                                            <Text>Gross Amount</Text>
                                            <Text>{formatMoney(data.totals.grossAmount)}</Text>
                                        </View>

                                        <View style={styles.totalRow}>
                                            <Text>Total Discount</Text>
                                            <Text>-{formatMoney(data.totals.totalDiscount)}</Text>
                                        </View>

                                        <View style={[styles.totalRow, styles.totalBold]}>
                                            <Text>Final Amount</Text>
                                            <Text>{formatMoney(data.totals.netAmount)}</Text>
                                        </View>
                                    </View>


                                    <View style={styles.amountWords}>
                                        <Text>
                                            Amount Chargeable (in words):{" "}
                                            <Text style={{ fontWeight: 700 }}>
                                                {numberToWords(data.totals.netAmount)}
                                            </Text>
                                        </Text>
                                    </View>

                                    <View style={styles.twoCol}>
                                        <View style={styles.bankBox}>
                                            {settings?.name && <Text>Account: {settings.name}</Text>}
                                            {settings?.bankName && <Text>Bank: {settings.bankName}</Text>}
                                            {settings?.accountNo && <Text>A/C No: {settings.accountNo}</Text>}
                                            {settings?.ifsc && <Text>IFSC: {settings.ifsc}</Text>}
                                            {settings?.upi && <Text>UPI: {settings.upi}</Text>}
                                        </View>

                                        <View style={styles.qrBox}>
                                            {settings?.qrCodeUrl && <Image src={'/api' + settings.qrCodeUrl} style={styles.qr} />}
                                        </View>
                                    </View>

                                    <View style={styles.billedBy}>
                                        <Text>For {settings?.name}</Text>
                                        <Text style={{ fontWeight: 700, marginTop: 12 }}>
                                            Authorized Signatory
                                        </Text>
                                        <Text>Recorded By: {data.billedBy}</Text>

                                        {data.status === "VOIDED" && (
                                            <View style={{ marginTop: 6 }}>
                                                <Text style={{ fontSize: 9, color: "#b91c1c" }}>
                                                    Voided By: {data.voidedBy}
                                                </Text>
                                                <Text style={{ fontSize: 9, color: "#b91c1c" }}>
                                                    Voided At:{" "}
                                                    {new Date(data.voidedAt!).toLocaleString("en-IN")}
                                                </Text>
                                            </View>
                                        )}

                                    </View>
                                    <Text style={styles.footer}>
                                        This is a computer-generated invoice
                                    </Text>
                                </View>
                            )
                        }

                    </Page >
                );
            })}
        </Document >
    );
}
