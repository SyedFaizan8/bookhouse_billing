import { SettingsInfoResponse } from "@/lib/queries/settings";
import { CompanyStatement } from "@/lib/types/company";
import { formatMoney } from "@/lib/utils/formatters";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from "@react-pdf/renderer";

/* ================= FONT ================= */

Font.register({
    family: "Mono",
    fonts: [
        { src: "/fonts/JetBrainsMono-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/JetBrainsMono-Bold.ttf", fontWeight: 700 },
    ],
});

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
    },

    header: {
        alignItems: "center",
        marginBottom: 12,
    },

    logo: {
        height: 50,
        marginBottom: 6,
    },

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
        backgroundColor: "#fff7ed",
        paddingVertical: 5,
        paddingHorizontal: 16,
        borderRadius: 14,
        fontWeight: 700,
        marginBottom: 12,
        fontSize: 10,
        color: "#9a3412",
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
    },

    altRow: {
        backgroundColor: "#fafafa",
    },

    cellDate: { width: "14%" },
    cellType: { width: "22%" },
    cellRef: { width: "18%" },
    cellDebit: {
        width: "15%",
        textAlign: "right",
        color: "#16a34a",
        fontSize: 9,
        letterSpacing: 0.3,
    },

    cellCredit: {
        width: "15%",
        textAlign: "right",
        color: "#dc2626",
        fontSize: 9,
        letterSpacing: 0.3,
    },

    cellBal: {
        width: "16%",
        textAlign: "right",
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: 0.3,
    },

    footer: {
        marginTop: 20,
        textAlign: "center",
        fontSize: 9,
        color: "#64748b",
    },

    signature: {
        marginTop: 40,
        textAlign: "right",
        fontSize: 10,
    },

    signatureBold: {
        fontWeight: 700,
        marginTop: 12,
    },
});

/* ================= PDF ================= */

export default function CompanyStatementPdf({
    data,
    settings
}: {
    data: CompanyStatement;
    settings: SettingsInfoResponse
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* TOP */}
                <View style={styles.rowBetween}>
                    <Text>Statement of Account</Text>
                    <Text>
                        {new Date().toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>
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

                <Text style={styles.badge}>COMPANY STATEMENT</Text>

                {/* SUPPLIER */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>Company Details</Text>

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
                    <Text style={styles.cellDate}>Date</Text>
                    <Text style={styles.cellType}>Particulars</Text>
                    <Text style={styles.cellRef}>Ref</Text>
                    <Text style={styles.cellDebit}>Debit (+)</Text>
                    <Text style={styles.cellCredit}>Credit (−)</Text>
                    <Text style={styles.cellBal}>Balance</Text>
                </View>

                {/* ROWS */}
                {data.rows.map((r, i) => (
                    <View
                        key={i}
                        style={i % 2 === 1 ? [styles.row, styles.altRow] : styles.row}
                    >
                        <Text style={styles.cellDate}>
                            {new Date(r.date).toLocaleDateString("en-IN")}
                        </Text>

                        <Text style={styles.cellType}>{r.type}</Text>

                        <Text style={styles.cellRef}>{r.refNo}</Text>

                        <Text style={styles.cellDebit}>
                            {r.debit ? formatMoney(r.debit) : "-"}
                        </Text>

                        <Text style={styles.cellCredit}>
                            {r.credit ? formatMoney(r.credit) : "-"}
                        </Text>

                        <Text style={styles.cellBal}>
                            {formatMoney(r.balance)}
                        </Text>
                    </View>
                ))}

                <Text
                    style={{
                        textAlign: "right",
                        fontSize: 8,
                        color: "#64748b",
                        marginTop: 6,
                    }}
                >
                    All amounts are in INR
                </Text>

                {/* SIGN */}
                <View style={styles.signature}>
                    <Text>For {data.company.name.toUpperCase()}</Text>
                    <Text style={styles.signatureBold}>Authorized Signatory</Text>
                </View>

                <Text style={styles.footer}>
                    This is a computer-generated supplier statement
                </Text>
            </Page>
        </Document>
    );
}
