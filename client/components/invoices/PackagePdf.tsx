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

/* ======================================================
   FONT
====================================================== */

Font.register({
    family: "Arial",
    fonts: [
        { src: "/fonts/LiberationSans-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/LiberationSans-Italic.ttf", fontWeight: 400, fontStyle: 'italic' },
        { src: "/fonts/LiberationSans-Bold.ttf", fontWeight: 700 },
    ],
})


/* ======================================================
   STYLES (INVOICE THEME APPLIED)
====================================================== */

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontFamily: "Arial",
        fontSize: 9,
        color: "#0f172a",
    },

    /* ================= HEADER ================= */

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 9,
        marginBottom: 6,
    },

    gstHeader: {
        fontWeight: 700
    },

    companyName: {
        fontSize: 30,
        fontWeight: 900,
        textAlign: "center",
        letterSpacing: 0.8,
        color: "#1e3a8a",
    },

    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    logoCol: {
        width: "25%",
        alignItems: "flex-start",
    },

    infoCol: {
        width: "50%",
        alignItems: "center",
    },

    qrWrap: {
        width: "25%",
        alignItems: "flex-end",
    },

    logo: { height: 46, width: 110 },

    centerInfo: {
        textAlign: "center",
        fontSize: 9,
        lineHeight: 1.3,
        color: "#475569",
    },

    qrBox: {
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: 6,
        alignItems: "center",
        width: 90,
    },

    qrText: {
        fontSize: 8,
        fontWeight: 800,
        marginBottom: 4,
    },

    qr: {
        width: 60,
        height: 60,
    },

    badge: {
        alignSelf: "center",
        backgroundColor: "#eef2ff",
        paddingVertical: 4,
        paddingHorizontal: 18,
        borderRadius: 16,
        fontWeight: 700,
        marginBottom: 8,
        fontSize: 10,
    },

    /* ================= CUSTOMER ================= */

    box: {
        border: "1px solid #e5e7eb",
        padding: 8,
        marginBottom: 10,
        borderRadius: 6,
        backgroundColor: "#f8fafc",
    },

    sectionTitle: {
        fontWeight: 700,
        fontSize: 10,
        textDecoration: "underline",
        marginBottom: 4,
    },

    bold: { fontWeight: 700 },

    /* ================= TABLE (GRID STYLE SAME AS INVOICE) ================= */

    table: {
        border: "1px solid #94a3b8",
    },

    row: {
        flexDirection: "row",
    },

    cell: {
        borderRight: "1px solid #cbd5e1",
        borderBottom: "1px solid #cbd5e1",
        paddingVertical: 4,
        paddingHorizontal: 4,
    },

    headerCell: {
        backgroundColor: "#f1f5f9",
        fontWeight: 800,
        borderTop: "1px solid #94a3b8",
    },

    num: { textAlign: "right" },
    center: { textAlign: "center" },

    /* column widths */
    c1: { width: 20, borderLeft: "1px solid #cbd5e1" },
    c2: { width: 180 },
    c3: { width: 40 },
    c4: { width: 110 },
    c5: { width: 50 },
    c6: { width: 60 },
    c7: { width: 70 },

    /* pending highlight */
    pending: {
        textAlign: "center",
        fontWeight: 800,
        color: "#b91c1c",
    },

    footer: {
        marginTop: 12,
        textAlign: "center",
        fontSize: 8,
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

    watermarkLogo: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 420,
        opacity: 0.07,
        transform: "translate(-190px, -190px)",
    },
});

/* ======================================================
   COMPONENT
====================================================== */

export default function PackagePdf({
    data,
    settings,
}: {
    data: InvoicePdfData;
    settings: SettingsInfoResponse;
}) {
    const items: Item[] = data.items || [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* WATERMARK */}
                {settings?.logoUrl && (
                    <Image
                        src={settings.logoUrl}
                        style={styles.watermarkLogo}
                        fixed
                    />
                )}

                {/* TOP BAR */}
                <View style={styles.topRow}>
                    <Text>Package No: {data.documentNo}</Text>
                    {settings.gst && <Text style={styles.gstHeader}>{`GSTIN: ${settings.gst}`}</Text>}
                    <Text>
                        {new Date(data.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>
                </View>

                {/* COMPANY NAME */}
                <Text style={styles.companyName}>
                    {settings?.name?.toUpperCase()}
                </Text>

                {/* LOGO + INFO + QR */}
                <View style={styles.logoRow}>
                    <View style={styles.logoCol}>
                        {settings?.logoUrl && (
                            <Image src={settings.logoUrl} style={styles.logo} />
                        )}
                    </View>

                    <View style={styles.infoCol}>
                        <Text style={styles.centerInfo}>
                            {settings.street && `${settings.street}\n`}
                            {[settings.town, settings.district, settings.state, settings.pincode]
                                .filter(Boolean)
                                .join(", ")}
                            {"\n"}
                            Phone: {settings.phone}
                            {settings.phoneSecondary && `, ${settings.phoneSecondary}`}
                            {settings.phoneTertiary && `, ${settings.phoneTertiary}`}
                            {settings.email && `\nEmail: ${settings.email}`}
                        </Text>
                    </View>

                    <View style={styles.qrWrap}>
                        {settings?.qrCodeUrl && (
                            <View style={styles.qrBox}>
                                <Text style={styles.qrText}>Scan & Pay</Text>
                                <Image src={settings.qrCodeUrl} style={styles.qr} />
                            </View>
                        )}
                    </View>
                </View>

                <Text style={styles.badge}>PACKAGE NOTE</Text>

                {/* SCHOOL */}
                <View style={styles.box}>
                    <Text style={styles.sectionTitle}>TO</Text>
                    <Text style={styles.bold}>{data.school.name}</Text>
                    <Text>
                        {[data.school.street, data.school.town, data.school.district, data.school.state, data.school.pincode]
                            .filter(Boolean)
                            .join(", ")}
                    </Text>
                    <Text>Phone: {data.school.phone}</Text>
                    {data.school?.email && <Text >Email: {data.school.email}</Text>}
                    {data.school?.gst && <Text >GSTIN: {data.school.gst}</Text>}
                </View>

                {/* ================= TABLE ================= */}
                <View style={styles.table}>

                    {/* HEADER */}
                    <View style={styles.row} fixed>
                        {[
                            "#",
                            "Description",
                            "Class",
                            "Company",
                            "Qty",
                            "Pending",
                            "MRP",
                        ].map((h, i) => (
                            <Text
                                key={i}
                                style={[
                                    styles.cell,
                                    styles.headerCell,
                                    styles[`c${i + 1}` as keyof typeof styles],
                                ]}
                            >
                                {h}
                            </Text>
                        ))}
                    </View>

                    {/* ROWS */}
                    {items.map((r, i) => (
                        <View key={i} style={styles.row} wrap={false}>
                            <Text style={[styles.cell, styles.c1]}>{i + 1}</Text>
                            <Text style={[styles.cell, styles.c2]}>{r.description}</Text>
                            <Text style={[styles.cell, styles.c3, styles.center]}>
                                {r.class || "-"}
                            </Text>
                            <Text style={[styles.cell, styles.c4]}>
                                {r.company || "-"}
                            </Text>
                            <Text style={[styles.cell, styles.c5, styles.center]}>
                                {r.quantity}
                            </Text>
                            <Text style={[styles.cell, styles.c6, styles.pending]}>
                                {r.pending ?? 0}
                            </Text>
                            <Text style={[styles.cell, styles.c7, styles.num]}>
                                {formatMoney(r.rate)}
                            </Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.footer}>
                    This is a computer-generated package note
                </Text>

            </Page>
        </Document>
    );
}
