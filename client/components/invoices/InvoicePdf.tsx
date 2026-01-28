import { API_BASE_URL } from "@/lib/constants";
import { SettingsInfoResponse } from "@/lib/queries/settings";
import { InvoicePdfData, Item } from "@/lib/types/invoice";
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
    family: "Inter",
    fonts: [
        { src: "/fonts/Inter_18pt-Regular.ttf", fontWeight: 400 },
        {
            src: "/fonts/Inter_18pt-Italic.ttf",
            fontWeight: 400,
            fontStyle: "italic",
        },
        { src: "/fonts/Inter_18pt-Medium.ttf", fontWeight: 500 },
        { src: "/fonts/Inter_18pt-Bold.ttf", fontWeight: 700 },
    ],
});

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
        fontFamily: "Inter",
        color: "#0f172a",
    },

    bold: {
        fontWeight: 700,
    },

    text: {
        fontSize: 10,
        color: "#0f172a",
    },

    muted: {
        fontSize: 9,
        color: "#475569",
    },


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
        paddingHorizontal: 16,
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
        wrap: false, // 🔒 row never splits
    },

    altRow: { backgroundColor: "#fafafa" },

    cellSl: { width: "5%", textAlign: "center" },

    cellDesc: {
        width: "28%",
        paddingRight: 4,
    },

    cellClass: {
        width: "7%",
        textAlign: "center",
    },

    cellCompany: {
        width: "15%",
        paddingRight: 4,
    },

    cellQty: { width: "7%", textAlign: "center" },

    cellRate: { width: "10%", textAlign: "right" },

    cellDiscPct: { width: "8%", textAlign: "center" },

    cellNet: {
        width: "10%",
        textAlign: "right",
        fontWeight: 500,
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
        width: "45%",
        alignSelf: "flex-end",
        border: "1px solid #c7d2fe",
        padding: 10,
        borderRadius: 6,
        backgroundColor: "#eef2ff",
    },

    totalRow: { flexDirection: "row", justifyContent: "space-between" },
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
        width: "65%",
        border: "1px solid #e5e7eb",
        padding: 10,
        borderRadius: 6,
    },

    qrBox: {
        width: "32%",
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
});

/* ================= HELPERS ================= */

const money = (value: number) =>
    Number(value || 0).toFixed(2);


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
                            </View>
                        </View>

                        <View style={styles.header}>
                            {settings?.logoUrl && (
                                <Image
                                    src={API_BASE_URL + settings.logoUrl}
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

                                    <Text style={styles.cellRate}>₹ {money(r.rate)}</Text>

                                    <Text style={styles.cellDiscPct}>{r.discountPercent}%</Text>

                                    <Text style={styles.cellNet}>₹ {money(r.netAmount)}</Text>
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
                                            <Text>₹ {money(data.totals.grossAmount)}</Text>
                                        </View>

                                        <View style={styles.totalRow}>
                                            <Text>Total Discount</Text>
                                            <Text>- ₹ {money(data.totals.totalDiscount)}</Text>
                                        </View>

                                        <View style={[styles.totalRow, styles.totalBold]}>
                                            <Text>Final Amount</Text>
                                            <Text>₹ {money(data.totals.netAmount)}</Text>
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
                                            {settings?.qrCodeUrl && <Image src={API_BASE_URL + settings.qrCodeUrl} style={styles.qr} />}
                                        </View>
                                    </View>

                                    <View style={styles.billedBy}>
                                        <Text>For {settings?.name}</Text>
                                        <Text style={{ fontWeight: 700, marginTop: 12 }}>
                                            Authorized Signatory
                                        </Text>
                                        <Text>Recorded By: {data.billedBy}</Text>
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
