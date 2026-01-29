import { API_BASE_URL } from "@/lib/constants";
import { SettingsInfoResponse } from "@/lib/queries/settings";
import { CompanyInvoicePdfData, Item } from "@/lib/types/invoice";
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

/* ================= FONT ================= */

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

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    header: {
        alignItems: "center",
        marginBottom: 12,
    },

    logo: { height: 54, marginBottom: 6 },

    title: {
        fontSize: 20,
        fontWeight: 700,
        color: "#1e3a8a",
    },

    companyInfo: {
        textAlign: "center",
        fontSize: 9,
        color: "#475569",
        marginTop: 2,
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
        borderRadius: 6,
        padding: 10,
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
        wrap: false,
    },

    altRow: { backgroundColor: "#fafafa" },

    cellSl: { width: "5%", textAlign: "center" },
    cellDesc: { width: "42%", paddingRight: 6 },
    cellClass: { width: "8%", textAlign: "center" },
    cellQty: { width: "10%", textAlign: "center" },
    cellRate: { width: "12%", textAlign: "right" },
    cellDisc: { width: "8%", textAlign: "center" },
    cellTotal: { width: "15%", textAlign: "right", fontWeight: 500 },

    totalsBox: {
        width: "45%",
        alignSelf: "flex-end",
        border: "1px solid #c7d2fe",
        padding: 10,
        borderRadius: 6,
        backgroundColor: "#eef2ff",
        marginTop: 12,
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

    footerRight: {
        marginTop: 20,
        textAlign: "right",
        fontSize: 10,
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
});

const money = (v: number) => Number(v || 0).toFixed(2);

/* ================= PDF ================= */

export default function PurchaseInvoicePdf({
    data,
    settings
}: {
    data: CompanyInvoicePdfData;
    settings: SettingsInfoResponse
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {data.status === "VOIDED" && (
                    <Text style={styles.watermark}>
                        VOIDED
                    </Text>
                )}

                {/* TOP */}
                <View style={styles.rowBetween}>
                    <Text>Purchase Invoice No: {data.documentNo}</Text>
                    <View>
                        <Text>
                            {new Date(data.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </Text>
                        {data.status === "VOIDED" && (
                            <View style={{ width: "100%", marginTop: 6 }}>
                                <Text style={styles.statusRibbon}>
                                    VOIDED
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* HEADER */}
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

                <Text style={styles.badge}>PURCHASE INVOICE</Text>

                {/* Company */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>
                        FROM (Company)
                    </Text>

                    <Text style={styles.bold}>
                        {data.company.name}
                    </Text>

                    {(data.company.street ||
                        data.company.town ||
                        data.company.district ||
                        data.company.state ||
                        data.company.pincode) && (
                            <Text>
                                {[
                                    data.company.street,
                                    data.company.town,
                                    data.company.district,
                                    data.company.state,
                                    data.company.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </Text>
                        )}

                    <Text>
                        Phone: {data.company.phone}
                    </Text>

                    {data.company.email && (
                        <Text>
                            Email: {data.company.email}
                        </Text>
                    )}

                    {data.company.gst && (
                        <Text>
                            GSTIN: {data.company.gst}
                        </Text>
                    )}

                </View>

                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                    <Text style={styles.cellSl}>#</Text>
                    <Text style={styles.cellDesc}>Description</Text>
                    <Text style={styles.cellClass}>Class</Text>
                    <Text style={styles.cellQty}>Qty</Text>
                    <Text style={styles.cellRate}>Rate</Text>
                    <Text style={styles.cellDisc}>Disc%</Text>
                    <Text style={styles.cellTotal}>Amount</Text>
                </View>

                {/* ROWS */}
                {data.items.map((r, i) => (
                    <View
                        key={i}
                        style={i % 2 ? [styles.row, styles.altRow] : styles.row}
                    >
                        <Text style={styles.cellSl}>{i + 1}</Text>
                        <Text style={styles.cellDesc}>{r.description}</Text>
                        <Text style={styles.cellClass}>{r.class || "-"}</Text>
                        <Text style={styles.cellQty}>{r.quantity}</Text>
                        <Text style={styles.cellRate}>₹ {money(r.rate)}</Text>
                        <Text style={styles.cellDisc}>{r.discountPercent}%</Text>
                        <Text style={styles.cellTotal}>₹ {money(r.netAmount)}</Text>
                    </View>
                ))}

                {/* TOTALS */}
                <View style={styles.totalsBox}>
                    <View style={styles.totalRow}>
                        <Text>Total Qty</Text>
                        <Text>{data.totals.totalQuantity}</Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text>Gross</Text>
                        <Text>₹ {money(data.totals.grossAmount)}</Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text>Discount</Text>
                        <Text>- ₹ {money(data.totals.totalDiscount)}</Text>
                    </View>

                    <View style={[styles.totalRow, styles.totalBold]}>
                        <Text>Total Payable</Text>
                        <Text>₹ {money(data.totals.netAmount)}</Text>
                    </View>
                </View>

                <View style={styles.amountWords}>
                    Amount in words:{" "}
                    <Text style={{ fontWeight: 700 }}>
                        {numberToWords(data.totals.netAmount)}
                    </Text>
                </View>

                {/* SIGNATURE */}
                <View style={styles.footerRight}>
                    <Text>For {settings.name}</Text>
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
                    This is a computer-generated purchase invoice
                </Text>

            </Page>
        </Document >
    );
}
