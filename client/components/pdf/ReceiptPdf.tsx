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
import { SettingsInfoResponse } from "@/lib/queries/settings";
import { API_BASE_URL } from "@/lib/constants";

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
        fontSize: 10,
        textDecoration: "underline",
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
    settings,
}: {
    data: ReceiptPdfData;
    settings: SettingsInfoResponse
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

                    {data.note && (
                        <View style={styles.row}>
                            <Text>Reference No</Text>
                            <Text>{data.note}</Text>
                        </View>
                    )}
                </View>

                {/* CUSTOMER */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>
                        Received From
                    </Text>

                    <Text>{data.school.name}</Text>

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

                    <Text>Phone: {data.school.phone}</Text>

                    {data.school.email && (
                        <Text>
                            Email: {data.school.email}
                        </Text>
                    )}

                    {data.school.gst && (
                        <Text>GSTIN: {data.school.gst}</Text>
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
                    <Text>For {settings.name}</Text>

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
