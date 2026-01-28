import { API_BASE_URL } from "@/lib/constants";
import { SettingsInfoResponse } from "@/lib/queries/settings";
import { InvoicePdfData, Item } from "@/lib/types/invoice";
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

    /* ================= HEADER ================= */

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
        color: "#1e3a8a",
    },

    companyInfo: {
        marginTop: 2,
        textAlign: "center",
        fontSize: 9,
        color: "#475569",
        lineHeight: 1.4,
    },

    badge: {
        alignSelf: "center",
        marginVertical: 10,
        paddingVertical: 4,
        paddingHorizontal: 20,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        border: "1px solid #6366f1",
        color: "#3730a3",
    },

    /* ================= CUSTOMER ================= */

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

    /* ================= TABLE ================= */

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

    cellSl: { width: "5%", textAlign: "center" },

    cellDesc: { width: "30%", paddingRight: 6 },

    cellClass: { width: "7%", textAlign: "center" },

    cellCompany: { width: "18%", paddingRight: 6 },

    cellQty: { width: "7%", textAlign: "center" },

    cellRate: { width: "10%", textAlign: "right" },

    cellDisc: { width: "8%", textAlign: "center" },

    cellTotal: {
        width: "15%",
        textAlign: "right",
        fontWeight: 600,
    },

    /* ================= FOOTER ================= */

    footerNote: {
        marginTop: 18,
        textAlign: "center",
        fontSize: 9,
        color: "#64748b",
    },
});


export default function CreditPdf({ data, settings }: { data: InvoicePdfData, settings: SettingsInfoResponse }) {

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>

                {/* HEADER */}
                <View style={styles.rowBetween}>
                    <Text>Credit Note No: {data.documentNo}</Text>
                    <Text>
                        {new Date(data.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>
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


                <Text style={styles.badge}>CREDIT NOTE</Text>

                {/* SCHOOL */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>
                        TO
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


                {/* TABLE HEADER */}
                <View style={styles.tableHeader} fixed>
                    <Text style={styles.cellSl}>#</Text>
                    <Text style={styles.cellDesc}>Description</Text>
                    <Text style={styles.cellClass}>Class</Text>
                    <Text style={styles.cellCompany}>Company</Text>
                    <Text style={styles.cellQty}>Qty</Text>
                    <Text style={styles.cellRate}>Rate</Text>
                    <Text style={styles.cellDisc}>Disc%</Text>
                    <Text style={styles.cellTotal}>Total</Text>
                </View>



                {/* ROWS */}
                {data.items.map((r, idx) => (
                    <View key={idx} style={styles.row} wrap={false}>
                        <Text style={styles.cellSl}>{idx + 1}</Text>

                        <Text style={styles.cellDesc}>{r.description}</Text>

                        <Text style={styles.cellClass}>{r.class || "-"}</Text>

                        <Text style={styles.cellCompany}>{r.company || "-"}</Text>

                        <Text style={styles.cellQty}>{r.quantity}</Text>

                        <Text style={styles.cellRate}>
                            ₹{Number(r.rate).toFixed(2)}
                        </Text>

                        <Text style={styles.cellDisc}>
                            {r.discountPercent}%
                        </Text>

                        <Text style={styles.cellTotal}>
                            ₹{Number(r.netAmount).toFixed(2)}
                        </Text>
                    </View>
                ))}
                <View
                    style={{
                        flexDirection: "row",
                        borderTop: "1px solid #000",
                        paddingTop: 6,
                        marginTop: -1,
                        fontWeight: 700,
                    }}
                >
                    <Text style={{ width: "85%", textAlign: "right", paddingRight: 8 }}>
                        TOTAL
                    </Text>

                    <Text style={{ width: "15%", textAlign: "right" }}>
                        ₹{Number(data.totals.netAmount).toFixed(2)}
                    </Text>
                </View>

                <View
                    style={{
                        marginTop: 24,
                        alignSelf: "flex-end",
                        textAlign: "right",
                    }}
                >
                    <Text>For {settings.name}</Text>

                    <Text
                        style={{
                            marginTop: 24,
                            fontWeight: 700,
                        }}
                    >
                        Authorized Signatory
                    </Text>
                </View>


                <Text style={styles.footerNote}>
                    This is a computer-generated document
                </Text>
            </Page>
        </Document>
    );
}
