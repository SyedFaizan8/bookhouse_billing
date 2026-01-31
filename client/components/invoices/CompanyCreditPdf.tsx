import { SettingsInfoResponse } from "@/lib/queries/settings";
import { CompanyInvoicePdfData } from "@/lib/types/invoice";
import { formatMoney } from "@/lib/utils/formatters";
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
    family: "Mono",
    fonts: [
        { src: "/fonts/JetBrainsMono-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/JetBrainsMono-Bold.ttf", fontWeight: 700 },
    ],
})

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    page: {
        padding: 36,
        fontSize: 10,
        fontFamily: "Mono",
        color: "#0f172a",
    },

    bold: {
        fontWeight: 700,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
        fontSize: 9,
    },

    header: {
        alignItems: "center",
        marginBottom: 12,
    },

    logo: {
        height: 52,
        marginBottom: 6,
    },

    title: {
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 0.5,
        color: "#991b1b",
    },

    companyInfo: {
        textAlign: "center",
        fontSize: 9,
        color: "#475569",
        marginTop: 2,
        lineHeight: 1.4,
    },

    badge: {
        alignSelf: "center",
        marginVertical: 10,
        paddingVertical: 4,
        paddingHorizontal: 22,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        border: "1px solid #dc2626",
        color: "#b91c1c",
    },

    box: {
        border: "1px solid #e5e7eb",
        padding: 10,
        borderRadius: 6,
        marginBottom: 14,
        backgroundColor: "#fafafa",
    },
    sectionTitle: {
        fontWeight: 700,
        fontSize: 10,
        textDecoration: "underline",
        marginBottom: 4,
    },

    tableHeader: {
        flexDirection: "row",
        borderTop: "1px solid #000",
        borderBottom: "1px solid #000",
        backgroundColor: "#f8fafc",
        paddingVertical: 6,
        fontWeight: 700,
    },

    row: {
        flexDirection: "row",
        borderBottom: "1px solid #e5e7eb",
        paddingVertical: 6,
        wrap: false,
    },

    cellSl: { width: "6%", textAlign: "center" },
    cellDesc: { width: "44%", paddingRight: 6 },
    cellClass: { width: "10%", textAlign: "center" },
    cellQty: { width: "10%", textAlign: "center" },
    cellRate: {
        width: "15%",
        textAlign: "right",
        fontFamily: "Mono",
        fontSize: 9,
    },

    cellTotal: {
        width: "15%",
        textAlign: "right",
        fontFamily: "Mono",
        fontSize: 9,
        fontWeight: 700,
    },

    footerNote: {
        marginTop: 20,
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

/* ================= PDF ================= */

export default function CompanyCreditNotePdf({
    data,
    settings
}: {
    data: CompanyInvoicePdfData;
    settings: SettingsInfoResponse
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>

                {data.status === "VOIDED" && (
                    <Text style={styles.watermark}>
                        VOIDED
                    </Text>
                )}

                {/* TOP */}
                <View style={styles.rowBetween}>
                    <Text>Credit Note No: {data.documentNo}</Text>
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

                    {/* Phone */}
                    <Text style={styles.companyInfo}>
                        Phone: {settings?.phone}
                        {settings?.phoneSecondary &&
                            `, ${settings.phoneSecondary}`}
                        {settings?.phoneTertiary &&
                            `, ${settings.phoneTertiary}`}
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

                <Text style={styles.badge}>COMPANY CREDIT NOTE</Text>

                {/* SUPPLIER */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>
                        TO (Company)
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
                <View style={styles.tableHeader} fixed>
                    <Text style={styles.cellSl}>#</Text>
                    <Text style={styles.cellDesc}>Description</Text>
                    <Text style={styles.cellClass}>Class</Text>
                    <Text style={styles.cellQty}>Qty</Text>
                    <Text style={styles.cellRate}>Rate</Text>
                    <Text style={styles.cellTotal}>Total</Text>
                </View>

                {/* ITEMS */}
                {data.items.map((r, idx) => (
                    <View key={idx} style={styles.row} wrap={false}>
                        <Text style={styles.cellSl}>{idx + 1}</Text>
                        <Text style={styles.cellDesc}>{r.description}</Text>
                        <Text style={styles.cellClass}>{r.class || "-"}</Text>
                        <Text style={styles.cellQty}>{r.quantity}</Text>
                        <Text style={styles.cellRate}>
                            {formatMoney(r.rate)}
                        </Text>
                        <Text style={styles.cellTotal}>
                            {formatMoney(r.netAmount)}
                        </Text>
                    </View>
                ))}

                {/* TOTAL */}
                <View
                    style={{
                        flexDirection: "row",
                        borderTop: "1px solid #000",
                        paddingTop: 6,
                        fontWeight: 700,
                    }}
                >
                    <Text
                        style={{
                            width: "85%",
                            textAlign: "right",
                            paddingRight: 8,
                        }}
                    >
                        TOTAL CREDIT
                    </Text>

                    <Text style={{
                        width: "15%", textAlign: "right", fontSize: 9, fontWeight: 700,
                    }}>
                        {formatMoney(data.totals.netAmount)}
                    </Text>
                </View>

                {/* SIGNATURE */}
                <View
                    style={{
                        marginTop: 26,
                        alignSelf: "flex-end",
                        textAlign: "right",
                    }}
                >
                    <Text>For {settings.name}</Text>

                    <Text style={{ marginTop: 22, fontWeight: 700 }}>
                        Authorized Signatory
                    </Text>
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

                <Text style={styles.footerNote}>
                    This is a computer-generated credit note
                </Text>
            </Page>
        </Document>
    );
}
