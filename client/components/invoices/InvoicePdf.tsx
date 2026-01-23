import { API_BASE_URL } from "@/lib/constants";
import { InvoicePdfData } from "@/lib/types/invoice";
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

    sectionTitle: { fontWeight: 700, marginBottom: 4 },

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
        width: "30%",
        maxLines: 3,
        overflow: "hidden",
    },
    cellQty: { width: "7%", textAlign: "center" },
    cellRate: { width: "10%", textAlign: "right" },
    cellAmt: { width: "12%", textAlign: "right" },
    cellDiscPct: { width: "8%", textAlign: "center" },
    cellDiscAmt: { width: "12%", textAlign: "right" },
    cellNet: { width: "12%", textAlign: "right", fontWeight: 500 },

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

function numberToWords(num: number): string {
    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen",
    ];
    const b = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const inWords = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
        if (n < 1000)
            return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
        if (n < 100000)
            return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
        if (n < 10000000)
            return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
        return "";
    };

    return inWords(Math.floor(num)).trim();
}


/* ================= DYNAMIC PAGINATION ================= */

function paginate(items: any[]) {
    const pages: any[][] = [];
    let current: any[] = [];
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

export default function InvoicePdf({ data }: { data: InvoicePdfData }) {

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
                            <Text>{data.invoiceNo}</Text>
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
                            {data.company.logoUrl && (
                                <Image src={API_BASE_URL + data.company.logoUrl} style={styles.logo} />
                            )}
                            <Text style={styles.title}>{data.company.name.toUpperCase()}</Text>
                            <Text style={styles.companyInfo}>
                                {data.company.address}{"\n"}
                                {data.company.phone}
                                {data.company.email && ` • ${data.company.email}`}{"\n"}
                                {data.company.gst && "GST: " + data.company.gst}
                            </Text>
                        </View>

                        <Text style={styles.badge}>BILL OF SUPPLY</Text>

                        {
                            pageIndex === 0 && (
                                <View style={styles.box}>
                                    <Text style={styles.sectionTitle}>Bill To</Text>
                                    <Text>Name: {data.customer.name}</Text>
                                    <Text>Address: {data.customer.address}</Text>
                                    {data.customer.phone && <Text>Phone: {data.customer.phone}</Text>}
                                    {data.customer.gst && <Text>{data.customer.gst}</Text>}
                                </View>
                            )
                        }

                        {/* TABLE HEADER */}
                        <View style={styles.tableHeader} >
                            <Text style={styles.cellSl}>#</Text>
                            <Text style={styles.cellDesc}>Description</Text>
                            <Text style={styles.cellQty}>Qty</Text>
                            <Text style={styles.cellRate}>Rate</Text>
                            <Text style={styles.cellAmt}>Amount</Text>
                            <Text style={styles.cellDiscPct}>Disc%</Text>
                            <Text style={styles.cellDiscAmt}>Disc</Text>
                            <Text style={styles.cellNet}>Net</Text>
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
                                    <Text style={styles.cellDesc}>{r.title}</Text>
                                    <Text style={styles.cellQty}>{r.qty}</Text>
                                    <Text style={styles.cellRate}>{r.rate}</Text>
                                    <Text style={styles.cellAmt}>{r.gross}</Text>
                                    <Text style={styles.cellDiscPct}>
                                        {r.discountPercent}%
                                    </Text>
                                    <Text style={styles.cellDiscAmt}>{r.discount}</Text>
                                    <Text style={styles.cellNet}>{r.net}</Text>
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
                                            <Text>Total Qty</Text>
                                            <Text>{data.totals.qty}</Text>
                                        </View>
                                        <View style={styles.totalRow}>
                                            <Text>Gross</Text>
                                            <Text>{data.totals.gross}</Text>
                                        </View>
                                        <View style={styles.totalRow}>
                                            <Text>Discount</Text>
                                            <Text>-{data.totals.discount}</Text>
                                        </View>
                                        <View style={[styles.totalRow, styles.totalBold]}>
                                            <Text>Final Amount</Text>
                                            <Text>{data.totals.final}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.amountWords}>
                                        <Text>
                                            Amount Chargeable (in words):{" "}
                                            <Text style={{ fontWeight: 700 }}>
                                                Rupees {numberToWords(data.totals.final)} Only
                                            </Text>
                                        </Text>
                                    </View>

                                    <View style={styles.twoCol}>
                                        <View style={styles.bankBox}>
                                            {data.company.name && <Text>Account: {data.company.name}</Text>}
                                            {data.company.bankName && <Text>Bank: {data.company.bankName}</Text>}
                                            {data.company.accountNo && <Text>A/C No: {data.company.accountNo}</Text>}
                                            {data.company.ifsc && <Text>IFSC: {data.company.ifsc}</Text>}
                                            {data.company.upi && <Text>UPI: {data.company.upi}</Text>}
                                        </View>

                                        <View style={styles.qrBox}>
                                            {data.company.qrCodeUrl && <Image src={API_BASE_URL + data.company.qrCodeUrl} style={styles.qr} />}
                                        </View>
                                    </View>

                                    <View style={styles.billedBy}>
                                        <Text>For {data.company.name}</Text>
                                        <Text style={{ fontWeight: 700, marginTop: 12 }}>
                                            Authorized Signatory
                                        </Text>
                                        <Text>Billed By: {data.billedBy}</Text>
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
