import { SettingsInfoResponse } from "@/lib/queries/settings";
import { InvoicePdfData, Item } from "@/lib/types/invoice";
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

/* ================= FONT REGISTRATION ================= */


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

    cellSl: {
        width: 28,
        textAlign: "center",
    },

    cellDesc: {
        width: 220,
        paddingRight: 6,
    },

    cellClass: {
        width: 50,
        textAlign: "center",
    },

    cellCompany: {
        width: 140,
        paddingRight: 6,
    },

    cellQty: {
        width: 50,
        textAlign: "center",
        fontWeight: 600,
    },

    cellMrp: {
        width: 110,
        textAlign: "right",
        fontFamily: "Mono",
        fontSize: 9,
    },


    /* ================= FOOTER ================= */

    footerNote: {
        marginTop: 18,
        textAlign: "center",
        fontSize: 9,
        color: "#64748b",
    },
});


export default function PackagePdf({ data, settings }: { data: InvoicePdfData, settings: SettingsInfoResponse }) {
    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>

                {/* HEADER */}
                <View style={styles.rowBetween}>
                    <Text>Package No: {data.documentNo}</Text>
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


                <Text style={styles.badge}>
                    PACKAGE NOTE
                </Text>

                {/* SCHOOL */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>To</Text>

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
                    <Text style={styles.cellMrp}>MRP</Text>
                </View>


                {/* ROWS */}
                {data.items.map((r, idx) => (
                    <View key={idx} style={styles.row} wrap={false}>
                        <Text style={styles.cellSl}>{idx + 1}</Text>

                        <Text style={styles.cellDesc}>{r.description}</Text>

                        <Text style={styles.cellClass}>{r.class || "-"}</Text>

                        <Text style={styles.cellCompany}>{r.company || "-"}</Text>

                        <Text style={styles.cellQty}>{r.quantity}</Text>

                        <Text style={styles.cellMrp}>{formatMoney(r.rate)}</Text>
                    </View>
                ))}

                <Text style={styles.footerNote}>
                    This is a computer-generated document
                </Text>
            </Page>
        </Document>
    );
}
