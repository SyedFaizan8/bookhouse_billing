import { SettingsInfoResponse } from "@/lib/queries/settings";
import { SchoolStatement } from "@/lib/types/school";
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
import { format } from "date-fns";


/* ================= FONT ================= */

Font.register({
    family: "Arial",
    fonts: [
        { src: "/fonts/LiberationSans-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/LiberationSans-Italic.ttf", fontWeight: 400, fontStyle: 'italic' },
        { src: "/fonts/LiberationSans-Bold.ttf", fontWeight: 700 },
    ],
})


/* ================= STYLES ================= */

export const styles = StyleSheet.create({
    page: {
        padding: 36,
        fontSize: 10,
        fontFamily: "Arial",
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
        fontSize: 30,
        fontWeight: 900,
        letterSpacing: 0.8,
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
        paddingHorizontal: 16,
        borderRadius: 14,
        fontWeight: 700,
        marginBottom: 12,
        fontSize: 10,
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

    cellDate: { width: "14%", textAlign: "left", paddingLeft: 6 },
    cellType: { width: "22%" },
    cellRef: { width: "15%" },
    cellDebit: {
        width: "15%",
        textAlign: "right",
        fontSize: 10,
        color: "#dc2626",
    },

    cellCredit: {
        width: "15%",
        textAlign: "right",
        fontSize: 10,
        color: "#16a34a",
    },

    cellBal: {
        width: "17%",
        textAlign: "right",
        fontSize: 10,
        fontWeight: 700,
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
    watermarkLogo: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 420,
        opacity: 0.07,
        transform: "translate(-190px, -190px)",
    },
});

/* ================= PDF ================= */

export default function SchoolStatementPdf({
    data,
    settings
}: {
    data: SchoolStatement
    settings: SettingsInfoResponse
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {settings?.logoUrl && (
                    <Image
                        src={settings.logoUrl}
                        style={styles.watermarkLogo}
                        fixed
                    />
                )}
                {/* TOP ROW */}
                <View style={styles.rowBetween}>
                    <Text>
                        Statement of Account
                    </Text>
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
                            src={settings.logoUrl}
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
                        <Text style={[styles.companyInfo, { fontWeight: 900 }]}>
                            GSTIN: {settings.gst}
                        </Text>
                    )}
                </View>

                <Text style={styles.badge}>SCHOOL STATEMENT</Text>

                {/* CUSTOMER */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>
                        Customer Details
                    </Text>

                    <Text style={styles.bold}>
                        {data.school.name}
                    </Text>


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
                            {format(new Date(r.date), "dd/MM/yyyy")}
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

                {/* SIGNATURE */}
                <View style={styles.signature}>
                    <Text>
                        For {settings.name.toUpperCase()}
                    </Text>

                    <Text style={styles.signatureBold}>
                        Authorized Signatory
                    </Text>
                </View>



                {/* FOOTER */}
                <Text style={styles.footer}>
                    This is a computer-generated customer statement
                </Text>
            </Page>
        </Document >
    );
}
