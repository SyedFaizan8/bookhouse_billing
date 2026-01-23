
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: "Helvetica",
    },

    header: {
        marginBottom: 14,
    },

    title: {
        fontSize: 14,
        fontWeight: "bold",
    },

    sub: {
        fontSize: 10,
        marginTop: 2,
    },

    tableHeader: {
        flexDirection: "row",
        borderBottom: 1,
        paddingBottom: 5,
        marginTop: 10,
        fontWeight: "bold",
    },

    row: {
        flexDirection: "row",
        paddingVertical: 4,
        borderBottom: 0.5,
    },

    date: { width: "15%" },
    type: { width: "15%" },
    ref: { width: "25%" },
    amt: { width: "15%", textAlign: "right" },
    bal: { width: "15%", textAlign: "right" },
});

export function DealerStatementPDF({
    dealerName,
    rows,
}: {
    dealerName: string;
    rows: any[];
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dealer Statement</Text>
                    <Text style={styles.sub}>Dealer: {dealerName}</Text>
                    <Text style={styles.sub}>
                        Generated on {new Date().toLocaleDateString()}
                    </Text>
                </View>

                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                    <Text style={styles.date}>Date</Text>
                    <Text style={styles.type}>Type</Text>
                    <Text style={styles.ref}>Reference</Text>
                    <Text style={styles.amt}>Debit</Text>
                    <Text style={styles.amt}>Credit</Text>
                    <Text style={styles.bal}>Balance</Text>
                </View>

                {/* ROWS */}
                {rows.map((r, i) => (
                    <View key={i} style={styles.row}>
                        <Text style={styles.date}>
                            {new Date(r.date).toLocaleDateString()}
                        </Text>

                        <Text style={styles.type}>{r.type}</Text>

                        <Text style={styles.ref}>{r.reference}</Text>

                        <Text style={styles.amt}>
                            {r.debit ? `₹${r.debit}` : "-"}
                        </Text>

                        <Text style={styles.amt}>
                            {r.credit ? `₹${r.credit}` : "-"}
                        </Text>

                        <Text style={styles.bal}>₹{r.balance}</Text>
                    </View>
                ))}
            </Page>
        </Document>
    );
}
