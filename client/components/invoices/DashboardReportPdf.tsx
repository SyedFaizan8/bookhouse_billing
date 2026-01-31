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
import { SettingsInfoResponse } from "@/lib/queries/settings"
import { DashboardPdfRow } from "@/lib/types/dashboard"
import { formatMoney } from "@/lib/utils/formatters"

/* ================= FONT ================= */

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
        fontSize: 9,
        fontFamily: "Mono",
        color: "#0f172a",
        backgroundColor: "#ffffff",
    },

    bold: { fontWeight: 700 },

    muted: {
        fontSize: 8.5,
        color: "#64748b",
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    /* ===== HEADER ===== */

    header: {
        alignItems: "center",
        marginBottom: 6,
    },

    logo: { height: 48, marginBottom: 6 },

    title: {
        fontSize: 18,
        fontWeight: 700,
        color: "#4f46e5",
        letterSpacing: 1,
    },

    companyInfo: {
        textAlign: "center",
        fontSize: 8.8,
        color: "#475569",
        lineHeight: 1.5,
    },

    badge: {
        alignSelf: "center",
        marginVertical: 12,
        paddingVertical: 5,
        paddingHorizontal: 30,
        borderRadius: 20,
        backgroundColor: "#eef2ff",
        color: "#4338ca",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.8,
    },

    /* ===== SUMMARY BAR ===== */

    summaryBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
    },

    summaryItem: {
        fontSize: 9,
        color: "#0f172a",
    },

    /* ===== TABLE ===== */

    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#eef2ff",
        borderTop: "1px solid #c7d2fe",
        borderBottom: "1px solid #c7d2fe",
        paddingVertical: 7,
        fontWeight: 700,
        color: "#1e1b4b",
    },

    row: {
        flexDirection: "row",
        paddingVertical: 6,
        borderBottom: "1px solid #e5e7eb",
    },

    altRow: {
        backgroundColor: "#f8fafc",
    },

    cellSl: { width: "4%", textAlign: "center" },

    cellDoc: { width: "13%" },

    cellType: { width: "11%" },

    cellParty: { width: "28%" },

    cellDate: { width: "12%" },

    cellAmount: {
        width: "17%",
        textAlign: "right",
        fontFamily: "Mono",
        fontSize: 8.6,
        letterSpacing: 0.2,
    },

    cellStatus: {
        width: "15%",
        alignItems: "center",
        justifyContent: "center",
    },

    statusPill: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
        fontSize: 8,
        fontWeight: 700,
        textAlign: "center",
        minWidth: 52,
    },


    footer: {
        marginTop: 20,
        textAlign: "center",
        fontSize: 8.5,
        color: "#64748b",
    },
})

/* ===== STATUS COLORS ===== */

const statusPillMap: Record<string, any> = {
    POSTED: { backgroundColor: "#dcfce7", color: "#166534" },
    ISSUED: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    VOIDED: { backgroundColor: "#fee2e2", color: "#b91c1c" },
    REVERSED: { backgroundColor: "#ffedd5", color: "#c2410c" },
}

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

                {/* TOP */}
                <View style={styles.rowBetween}>
                    <Text style={styles.muted}>Generated on</Text>
                    <Text style={styles.muted}>
                        {format(new Date(), "dd MMM yyyy")}
                    </Text>
                </View>

                {/* HEADER */}
                <View style={styles.header}>
                    {settings.logoUrl && (
                        <Image
                            src={'/api' + settings.logoUrl}
                            style={styles.logo}
                        />
                    )}

                    <Text style={styles.title}>
                        {settings.name?.toUpperCase()}
                    </Text>

                    <Text style={styles.companyInfo}>
                        {[settings.street, settings.town, settings.district, settings.state, settings.pincode]
                            .filter(Boolean)
                            .join(", ")}
                    </Text>

                    <Text style={styles.companyInfo}>
                        Phone: {settings.phone}
                    </Text>
                </View>

                {/* BADGE */}
                <Text style={styles.badge}>{title.toUpperCase()}</Text>

                {/* SUMMARY */}
                <View
                    style={{
                        backgroundColor: "#f8fafc",
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 14,
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Text style={{ fontSize: 9 }}>
                        Total Records: {rows.length}
                    </Text>

                    <Text style={{ fontSize: 9, color: "#64748b" }}>
                        Auto generated
                    </Text>
                </View>


                {/* TABLE HEADER */}
                <View style={styles.tableHeader} fixed>
                    <Text style={styles.cellSl}>#</Text>
                    <Text style={styles.cellDoc}>Doc No</Text>
                    <Text style={styles.cellType}>Type</Text>
                    <Text style={styles.cellParty}>Party</Text>
                    <Text style={styles.cellDate}>Date</Text>
                    <Text style={styles.cellAmount}>Amount</Text>
                    <View style={styles.cellStatus}>
                        <Text>Status</Text>
                    </View>
                </View>

                {/* ROWS */}
                {rows.map((r, idx) => (
                    <View
                        key={idx}
                        style={idx % 2 ? [styles.row, styles.altRow] : styles.row}
                    >
                        <Text style={styles.cellSl}>{idx + 1}</Text>
                        <Text style={styles.cellDoc}>{r.docNo}</Text>
                        <Text style={styles.cellType}>{r.kind.replace("_", " ")}</Text>
                        <Text style={styles.cellParty}>{r.party}</Text>
                        <Text style={styles.cellDate}>
                            {format(new Date(r.date), "dd/MM/yyyy")}
                        </Text>

                        <Text style={styles.cellAmount}>
                            {formatMoney(Number(r.amount))}
                        </Text>

                        <View style={styles.cellStatus}>
                            <Text
                                style={[
                                    styles.statusPill,
                                    statusPillMap[r.status] || {},
                                ]}
                            >
                                {r.status}
                            </Text>
                        </View>

                    </View>
                ))}

                <Text style={styles.footer}>
                    This is a computer-generated report
                </Text>

            </Page>
        </Document>
    )
}
