// import {
//     Document,
//     Page,
//     Text,
//     View,
//     StyleSheet,
//     Font,
// } from "@react-pdf/renderer";
// import { ReceiptPdfData } from "@/lib/types/payments";

// Font.register({
//     family: "Inter",
//     fonts: [
//         { src: "/fonts/Inter_18pt-Regular.ttf" },
//         { src: "/fonts/Inter_18pt-Bold.ttf", fontWeight: 700 },
//     ],
// });

// const styles = StyleSheet.create({
//     page: {
//         padding: 40,
//         fontSize: 11,
//         fontFamily: "Inter",
//     },

//     header: {
//         textAlign: "center",
//         marginBottom: 20,
//     },

//     title: {
//         fontSize: 18,
//         fontWeight: 700,
//     },

//     box: {
//         border: "1px solid #e5e7eb",
//         padding: 12,
//         borderRadius: 6,
//         marginBottom: 12,
//     },

//     row: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 6,
//     },

//     amount: {
//         fontSize: 18,
//         fontWeight: 700,
//         textAlign: "center",
//         marginVertical: 20,
//     },

//     footer: {
//         marginTop: 30,
//         textAlign: "center",
//         fontSize: 9,
//         color: "#64748b",
//     },
// });

// export default function ReceiptPdf({ data }: { data: ReceiptPdfData }) {
//     return (
//         <Document>
//             <Page size="A4" style={styles.page}>
//                 {/* HEADER */}
//                 <View style={styles.header}>
//                     <Text style={styles.title}>{data.company.name.toUpperCase()}</Text>
//                     <Text>{data.company.address}</Text>
//                     {data.company.phone && <Text>{data.company.phone}</Text>}
//                 </View>

//                 <View style={styles.box}>
//                     <View style={styles.row}>
//                         <Text>Receipt No</Text>
//                         <Text>{data.receiptNo}</Text>
//                     </View>
//                     <View style={styles.row}>
//                         <Text>Date</Text>
//                         <Text>
//                             {new Date(data.date).toLocaleDateString("en-IN")}
//                         </Text>
//                     </View>
//                 </View>

//                 <View style={styles.box}>
//                     <Text>Received From:</Text>
//                     <Text>{data.customer.name}</Text>
//                     {data.customer.phone && (
//                         <Text>{data.customer.phone}</Text>
//                     )}
//                 </View>

//                 <Text style={styles.amount}>
//                     Amount Received: ₹{data.amount}
//                 </Text>

//                 <View style={styles.box}>
//                     <Text>Payment Mode: {data.mode}</Text>
//                     {data.referenceNo && (
//                         <Text>Reference No: {data.referenceNo}</Text>
//                     )}
//                 </View>

//                 <View style={{ marginTop: 40, textAlign: "right" }}>
//                     <Text>Authorized Signature</Text>
//                 </View>

//                 <Text style={styles.footer}>
//                     This is a computer-generated receipt
//                 </Text>
//             </Page>
//         </Document>
//     );
// }

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from "@react-pdf/renderer";
import { ReceiptPdfData } from "@/lib/types/payments";

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
        marginBottom: 14,
    },

    logo: {
        height: 56,
        marginBottom: 6,
    },

    title: {
        fontSize: 20,
        fontWeight: 700,
        color: "#166534",
    },

    companyInfo: {
        textAlign: "center",
        fontSize: 9,
        color: "#475569",
        marginTop: 4,
    },

    badge: {
        alignSelf: "center",
        backgroundColor: "#ecfdf5",
        color: "#166534",
        paddingVertical: 5,
        paddingHorizontal: 18,
        borderRadius: 18,
        fontWeight: 700,
        marginBottom: 14,
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
        marginBottom: 4,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },

    amountBox: {
        border: "1px solid #86efac",
        backgroundColor: "#ecfdf5",
        borderRadius: 8,
        padding: 14,
        marginVertical: 18,
        alignItems: "center",
    },

    amountText: {
        fontSize: 20,
        fontWeight: 700,
        color: "#166534",
    },

    footerRight: {
        marginTop: 24,
        alignSelf: "flex-end",
        textAlign: "right",
    },

    footerNote: {
        marginTop: 18,
        textAlign: "center",
        fontSize: 9,
        color: "#64748b",
    },
});

/* ================= PDF ================= */

export default function ReceiptPdf({
    data,
}: {
    data: ReceiptPdfData;
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* TOP BAR */}
                <View style={styles.rowBetween}>
                    <Text>Receipt No: {data.receiptNo}</Text>
                    <Text>
                        {new Date(data.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>
                </View>

                {/* HEADER */}
                <View style={styles.header}>
                    <Image src="/logo.png" style={styles.logo} />

                    <Text style={styles.title}>
                        {data.company.name.toUpperCase()}
                    </Text>

                    <Text style={styles.companyInfo}>
                        {data.company.address}{"\n"}
                        {data.company.phone}
                        {data.company.email &&
                            ` • ${data.company.email}`}{"\n"}
                        {data.company.gst &&
                            `GST: ${data.company.gst}`}
                    </Text>
                </View>

                {/* BADGE */}
                <Text style={styles.badge}>PAYMENT RECEIPT</Text>

                {/* RECEIPT DETAILS */}
                <View style={styles.box}>
                    <View style={styles.row}>
                        <Text>Receipt No</Text>
                        <Text>{data.receiptNo}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text>Payment Mode</Text>
                        <Text>{data.mode}</Text>
                    </View>

                    {data.referenceNo && (
                        <View style={styles.row}>
                            <Text>Reference No</Text>
                            <Text>{data.referenceNo}</Text>
                        </View>
                    )}
                </View>

                {/* CUSTOMER */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>
                        Received From
                    </Text>

                    <Text>{data.customer.name}</Text>

                    {data.customer.phone && (
                        <Text>Phone: {data.customer.phone}</Text>
                    )}

                    {data.customer.gst && (
                        <Text>GSTIN: {data.customer.gst}</Text>
                    )}
                </View>

                {/* AMOUNT */}
                <View style={styles.amountBox}>
                    <Text>Amount Received</Text>
                    <Text style={styles.amountText}>
                        ₹ {data.amount.toLocaleString("en-IN")}
                    </Text>
                </View>

                {/* SIGNATURE */}
                <View style={styles.footerRight}>
                    <Text>For {data.company.name}</Text>

                    <Text
                        style={{
                            fontWeight: 700,
                            marginTop: 14,
                        }}
                    >
                        Authorized Signatory
                    </Text>

                    <Text style={{ marginTop: 4 }}>
                        Recorded By: {data.recordedBy}
                    </Text>
                </View>

                {/* FOOTER */}
                <Text style={styles.footerNote}>
                    This is a computer-generated payment receipt
                </Text>
            </Page>
        </Document>
    );
}
