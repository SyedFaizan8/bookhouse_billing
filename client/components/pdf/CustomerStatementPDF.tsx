import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from "@react-pdf/renderer";

import { CustomerStatement, StatementRow } from "@/lib/types/customer";

/* ================= FONT ================= */

Font.register({
    family: "Inter",
    fonts: [
        { src: "/fonts/Inter_18pt-Regular.ttf", fontWeight: 400 },
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
        marginBottom: 4,
        fontSize: 11,
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
        color: "#dc2626",
    },
    cellCredit: {
        width: "15%",
        textAlign: "right",
        color: "#16a34a",
    },
    cellBal: {
        width: "16%",
        textAlign: "right",
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
});

/* ================= PDF ================= */

export default function StatementPdf({
    data,
}: {
    data: CustomerStatement
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* TOP ROW */}
                <View style={styles.rowBetween}>
                    <Text>
                        Statement of Account
                    </Text>
                    <Text>
                        {new Date().toLocaleDateString("en-IN")}
                    </Text>
                </View>

                {/* HEADER */}
                <View style={styles.header}>
                    <Image src="/logo.png" style={styles.logo} />

                    <Text style={styles.title}>
                        {data.company.name.toUpperCase()}
                    </Text>

                    <Text style={styles.companyInfo}>
                        {data.company.address}
                        {"\n"}
                        {data.company.phone}
                        {data.company.gst && ` • GST: ${data.company.gst}`}
                    </Text>
                </View>

                <Text style={styles.badge}>
                    CUSTOMER STATEMENT
                </Text>

                {/* CUSTOMER */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>
                        Customer Details
                    </Text>

                    <Text>Name: {data.customer.name}</Text>
                    {data.customer.address && (
                        <Text>Address: {data.customer.address}</Text>
                    )}
                    {data.customer.phone && (
                        <Text>Phone: {data.customer.phone}</Text>
                    )}
                    {data.customer.gst && (
                        <Text>GSTIN: {data.customer.gst}</Text>
                    )}
                </View>

                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                    <Text style={styles.cellDate}>Date</Text>
                    <Text style={styles.cellType}>Particulars</Text>
                    <Text style={styles.cellRef}>Ref</Text>
                    <Text style={styles.cellDebit}>Debit</Text>
                    <Text style={styles.cellCredit}>Credit</Text>
                    <Text style={styles.cellBal}>Balance</Text>
                </View>

                {/* ROWS */}
                {data.rows.map((r, i) => (
                    <View
                        key={i}
                        style={
                            i % 2 === 1
                                ? [styles.row, styles.altRow]
                                : styles.row
                        }
                    >
                        <Text style={styles.cellDate}>
                            {new Date(r.date).toLocaleDateString("en-IN")}
                        </Text>

                        <Text style={styles.cellType}>
                            {r.type}
                        </Text>

                        <Text style={styles.cellRef}>
                            {r.ref}
                        </Text>

                        <Text style={styles.cellDebit}>
                            {r.debit ? `₹${r.debit}` : ""}
                        </Text>

                        <Text style={styles.cellCredit}>
                            {r.credit ? `₹${r.credit}` : ""}
                        </Text>

                        <Text style={styles.cellBal}>
                            ₹{r.balance}
                        </Text>
                    </View>
                ))}

                {/* SIGNATURE */}
                <View style={styles.signature}>
                    <Text>
                        For {data.company.name.toUpperCase()}
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
        </Document>
    );
}
