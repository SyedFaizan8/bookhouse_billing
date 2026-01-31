import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from "@react-pdf/renderer"
import { format } from "date-fns"
import { API_BASE_URL } from "@/lib/constants"
import { SettingsInfoResponse } from "@/lib/queries/settings"
import { DashboardPdfRow } from "@/lib/types/dashboard"

/* ================= FONT ================= */

Font.register({
    family: "Inter",
    fonts: [
        { src: "/fonts/Inter_18pt-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Inter_18pt-Medium.ttf", fontWeight: 500 },
        { src: "/fonts/Inter_18pt-Bold.ttf", fontWeight: 700 },
    ],
})

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    page: {
        padding: 36,
        fontSize: 9,
        fontFamily: "Inter",
        color: "#0f172a",
    },

    /* ---------- common ---------- */

    bold: { fontWeight: 700 },

    muted: {
        color: "#475569",
        fontSize: 8.5,
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    /* ---------- header ---------- */

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
        color: "#1e3a8a",
        letterSpacing: 0.6,
    },

    companyInfo: {
        textAlign: "center",
        fontSize: 8.8,
        color: "#475569",
        lineHeight: 1.4,
    },

    badge: {
        alignSelf: "center",
        marginVertical: 12,
        paddingVertical: 4,
        paddingHorizontal: 26,
        borderRadius: 20,
        border: "1px solid #6366f1",
        color: "#3730a3",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.4,
    },

    /* ---------- table ---------- */

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
        wrap: true,
    },

    cellSl: { width: "5%", textAlign: "center" },
    cellDoc: { width: "16%" },
    cellType: { width: "14%" },
    cellParty: { width: "27%" },
    cellDate: { width: "14%" },
    cellAmount: { width: "14%", textAlign: "right" },
    cellStatus: { width: "10%", textAlign: "center" },

    footer: {
        marginTop: 20,
        textAlign: "center",
        fontSize: 8.5,
        color: "#64748b",
    },
})

/* ================= COMPONENT ================= */

export default function DashboardReportPdf({
    rows,
    settings,
    title,
}: {
    rows: DashboardPdfRow[]
    settings: SettingsInfoResponse
    title: string
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>

                {/* TOP META */}
                <View style={styles.rowBetween}>
                    <Text style={styles.muted}>
                        Generated on
                    </Text>
                    <Text style={styles.muted}>
                        {format(new Date(), "dd MMM yyyy")}
                    </Text>
                </View>

                {/* HEADER */}
                <View style={styles.header}>
                    {settings.logoUrl && (
                        <Image
                            src={API_BASE_URL + settings.logoUrl}
                            style={styles.logo}
                        />
                    )}

                    <Text style={styles.title}>
                        {settings.name?.toUpperCase()}
                    </Text>

                    {(settings.street ||
                        settings.town ||
                        settings.district ||
                        settings.state ||
                        settings.pincode) && (
                            <Text style={styles.companyInfo}>
                                {[settings.street, settings.town, settings.district, settings.state, settings.pincode]
                                    .filter(Boolean)
                                    .join(", ")}
                            </Text>
                        )}

                    <Text style={styles.companyInfo}>
                        Phone: {settings.phone}
                        {settings.phoneSecondary && `, ${settings.phoneSecondary}`}
                        {settings.phoneTertiary && `, ${settings.phoneTertiary}`}
                    </Text>

                    {settings.email && (
                        <Text style={styles.companyInfo}>
                            Email: {settings.email}
                        </Text>
                    )}

                    {settings.gst && (
                        <Text style={styles.companyInfo}>
                            GSTIN: {settings.gst}
                        </Text>
                    )}
                </View>

                {/* BADGE */}
                <Text style={styles.badge}>
                    {title.toUpperCase()}
                </Text>

                {/* TABLE HEADER */}
                <View style={styles.tableHeader} fixed>
                    <Text style={styles.cellSl}>#</Text>
                    <Text style={styles.cellDoc}>Doc No</Text>
                    <Text style={styles.cellType}>Type</Text>
                    <Text style={styles.cellParty}>Party</Text>
                    <Text style={styles.cellDate}>Date</Text>
                    <Text style={styles.cellAmount}>Amount</Text>
                    <Text style={styles.cellStatus}>Status</Text>
                </View>

                {/* ROWS — wraps automatically */}
                {rows.map((r, idx) => (
                    <View key={idx} style={styles.row}>
                        <Text style={styles.cellSl}>{idx + 1}</Text>
                        <Text style={styles.cellDoc}>{r.docNo}</Text>
                        <Text style={styles.cellType}>
                            {r.kind.replace("_", " ")}
                        </Text>
                        <Text style={styles.cellParty}>{r.party}</Text>
                        <Text style={styles.cellDate}>
                            {format(new Date(r.date), "dd/MM/yyyy")}
                        </Text>
                        <Text style={styles.cellAmount}>
                            ₹{Number(r.amount).toFixed(2)}
                        </Text>
                        <Text style={styles.cellStatus}>{r.status}</Text>
                    </View>
                ))}

                {/* FOOTER */}
                <Text style={styles.footer}>
                    This is a computer-generated report
                </Text>

            </Page>
        </Document>
    )
}
