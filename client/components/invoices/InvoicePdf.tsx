import { SettingsInfoResponse } from "@/lib/queries/settings";
import { InvoicePdfData, Item } from "@/lib/types/invoice";
import { formatMoney } from "@/lib/utils/formatters";
import { numberToWords } from "@/lib/utils/numberToWords";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from "@react-pdf/renderer";

/* ================= FONT ================= */

Font.register({
    family: "Mono",
    fonts: [
        { src: "/fonts/JetBrainsMono-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/JetBrainsMono-Bold.ttf", fontWeight: 700 },
    ],
});

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontFamily: "Mono",
        // fontSize: 7,
        fontSize: 8,
        color: "#0f172a",
        flexShrink: 1, // new added
    },

    /* HEADER */

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 9,
        // fontSize: 8,
        marginBottom: 4,
    },

    gstHeader: {
        fontWeight: 700
    },

    companyName: {
        fontSize: 30,
        // fontSize: 28,
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


    logo: { height: 46, width: 110 },

    qr: {
        width: 60,
        height: 60,
    },

    centerInfo: {
        textAlign: "center",
        fontSize: 8.5,
        lineHeight: 1.2,
        color: "#475569",
    },

    badge: {
        alignSelf: "center",
        backgroundColor: "#eef2ff",
        paddingVertical: 5,
        paddingHorizontal: 18,
        borderRadius: 16,
        fontWeight: 700,
        marginBottom: 6,
        fontSize: 9
    },

    billBox: {
        border: "1px solid #e5e7eb",
        padding: 6,
        marginBottom: 6,
    },

    /* ================= TABLE (true grid) ================= */

    table: {
        border: "1px solid #94a3b8",
    },

    row: {
        flexDirection: "row",
        // allow wrapping so long text breaks; do NOT set wrap:false
    },

    cell: {
        borderRight: "1px solid #cbd5e1",
        borderBottom: "1px solid #cbd5e1",
        paddingVertical: 3,        // reduced vertical padding
        paddingHorizontal: 4,      // slight horizontal padding
        // text wraps by default
    },

    headerCell: {
        backgroundColor: "#f1f5f9",
        fontWeight: 800,
        fontSize: 8,               // header slightly bigger
        borderTop: "1px solid #94a3b8",
    },

    num: {
        textAlign: "right",
        fontFamily: "Mono",
        fontSize: 9,
    },

    center: { textAlign: "center" },

    /* Flexible column defs with slightly reduced widths but minWidth enforced */
    c1: { flexBasis: 20, flexShrink: 0, minWidth: 18, borderLeft: "1px solid #cbd5e1" },    // #
    c2: { flexGrow: 2, flexBasis: 160, minWidth: 90, fontWeight: 900, },     // Description (bigger flexBasis)
    c3: { flexBasis: 30, flexShrink: 0, minWidth: 28 },    // Class
    c4: { flexGrow: 1, flexBasis: 80, minWidth: 50 },      // Company
    c5: { flexBasis: 38, flexShrink: 0, minWidth: 36, fontWeight: 900 },    // Qty
    c6: { flexBasis: 56, flexShrink: 1, minWidth: 40, maxWidth: 100, fontWeight: 900 },   // Rate
    c7: { flexBasis: 72, flexShrink: 1, minWidth: 50, maxWidth: 110 },  // Gross
    c8: { flexBasis: 38, flexShrink: 0, minWidth: 36 },    // Disc %
    c9: { flexBasis: 64, flexShrink: 1, minWidth: 46, maxWidth: 100, fontWeight: 900 },  // Disc Amt
    c10: { flexBasis: 76, flexShrink: 1, minWidth: 56, maxWidth: 120, fontWeight: 900 },  // Total

    totalsRow: {
        backgroundColor: "#f8fafc",
        fontWeight: 900,
    },

    /* BANK */

    bankWrap: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },

    bankBox: {
        width: "60%",
        backgroundColor: "#f0fdf4",
        borderLeft: "4px solid #16a34a",
        padding: 6,
        fontSize: 7.5,
        opacity: 0.5
    },

    label: {
        width: 60,                 // SAME WIDTH → Perfect Alignment
        color: "#ff0000",
        fontWeight: "600",
        opacity: 1,
    },

    value: {
        flex: 1,
        color: "#0073ff",          // Soft blue
        fontWeight: "500",
        opacity: 1,
    },

    bankTitle: {
        fontWeight: "700",
        fontSize: 10,
        marginBottom: 2,
        opacity: 1,
    },

    signBox: {
        width: "35%",
        alignItems: "flex-end",
        fontSize: 7.5,
    },

    signLine: {
        marginTop: 26,
        borderTop: "1px solid #000",
        width: 120,
        textAlign: "center",
        paddingTop: 3,
    },

    footer: {
        marginTop: 8,
        textAlign: "center",
        fontSize: 7,
    },

    qrWrap: {
        width: "25%",
        alignItems: "flex-end",
    },

    qrText: {
        fontSize: 7,
        fontWeight: 800,
        textAlign: "center",
        marginBottom: 4,
    },

    billTitle: {
        fontWeight: 800,
        fontSize: 8,
        marginBottom: 2,
        textDecoration: "underline",
    },

    billText: {
        fontSize: 7.5,
    },

    logoCol: {
        width: "25%",
        alignItems: "flex-start",
    },

    infoCol: {
        width: "50%",
        alignItems: "center",
    },

    qrBox: {
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 2,
        alignItems: "center",
        justifyContent: "center",
        width: 90,
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

/* ================= HELPERS ================= */

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/* ================= COMPONENT ================= */

export default function InvoicePdf({
    data,
    settings,
}: {
    data: InvoicePdfData;
    settings: SettingsInfoResponse;
}) {


    const items: Item[] = data.items || [];

    /* ===== CALCULATIONS (FIXED LOGIC) ===== */

    const computed = items.map((i) => {
        const qty = Number(i.quantity) || 0;
        const rate = Number(i.rate) || 0;

        const gross = r2(qty * rate);

        const net =
            i.netAmount != null
                ? Number(i.netAmount)
                : r2(gross - gross * ((Number(i.discountPercent) || 0) / 100));

        const discAmt = r2(gross - net);

        return { ...i, qty, rate, gross, discAmt, net };
    });

    const totals = computed.reduce(
        (a, b) => ({
            qty: a.qty + b.qty,
            gross: r2(a.gross + b.gross),
            disc: r2(a.disc + b.discAmt),
            net: r2(a.net + b.net),
        }),
        { qty: 0, gross: 0, disc: 0, net: 0 }
    );

    // pick font-size based on formatted string length
    const numberFontSize = (s: string) => {
        if (!s) return 8;
        // count visible characters (including commas and decimals)
        const len = String(s).length;

        if (len <= 10) return 7.5;
        if (len <= 13) return 6.5;
        if (len <= 16) return 5.5;
        return 5; // very long numbers -> smallest readable size
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {settings?.logoUrl && (
                    <Image
                        src={settings.logoUrl}
                        style={styles.watermarkLogo}
                        fixed
                    />
                )}

                {/* Top line */}
                <View style={styles.topRow}>
                    <Text>{String(data.kind).toLowerCase() + " no: "}{data.documentNo}</Text>
                    {settings.gst && <Text style={styles.gstHeader}>{`GSTIN: ${settings.gst}`}</Text>}
                    <View>
                        <Text>{new Date(data.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                        </Text>

                    </View>
                </View>

                {/* Company name */}
                <Text style={styles.companyName}>{settings?.name?.toUpperCase()}</Text>

                {/* logo | info | qr */}
                <View style={styles.logoRow}>
                    {/* LEFT — Logo */}
                    <View style={styles.logoCol}>
                        {settings?.logoUrl && (
                            <Image src={settings.logoUrl} style={styles.logo} />
                        )}
                    </View>

                    {/* CENTER — Perfectly centered info */}
                    <View style={styles.infoCol}>
                        <Text style={styles.centerInfo}>
                            {settings.street && `${settings.street} \n`}
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

                    {/* RIGHT — QR */}
                    <View style={styles.qrWrap}>
                        {settings?.qrCodeUrl && (
                            <View style={styles.qrBox}>
                                <Text style={styles.qrText}>Scan & Pay</Text>
                                <Image src={settings.qrCodeUrl} style={styles.qr} />
                            </View>
                        )}
                    </View>

                </View>

                <Text style={styles.badge}>{String(data.kind) === "INVOICE" ? "BILL OF SUPPLY" : data.kind}</Text>

                {/* BILL TO */}
                <View style={styles.billBox}>
                    <Text style={styles.billTitle}>{String(data.kind) === "INVOICE" ? "BILL TO" : "TO"}</Text>

                    <Text style={{ fontWeight: 700, ...styles.billText }}>
                        {data.school?.name}
                    </Text>

                    {data.school?.contactPerson && (
                        <Text style={styles.billText}>
                            Attn: {data.school.contactPerson}
                        </Text>
                    )}

                    <Text style={styles.billText}>
                        {[data.school?.street, data.school?.town, data.school?.district, data.school?.state, data.school?.pincode]
                            .filter(Boolean)
                            .join(", ")}
                    </Text>

                    {data.school?.phone && (
                        <Text style={styles.billText}>Phone: {data.school.phone}</Text>
                    )}

                    {data.school?.email && (
                        <Text style={styles.billText}>Email: {data.school.email}</Text>
                    )}

                    {data.school?.gst && (
                        <Text style={styles.billText}>GSTIN: {data.school.gst}</Text>
                    )}
                </View>

                {/* ================= TABLE ================= */}

                {/* Header  */}
                <View style={styles.row} fixed>
                    {[
                        styles.c1, styles.c2, styles.c3, styles.c4,
                        styles.c5, styles.c6, styles.c7, styles.c8,
                        styles.c9, styles.c10
                    ].map((colStyle, idx) => (
                        <Text key={idx} style={[styles.cell, styles.headerCell, colStyle]}>
                            {["#", "Description", "Cls", "Company", "Qty", "Rate", "Gross", "Disc%", "Disc Amt", "Total"][idx]}
                        </Text>
                    ))}
                </View>

                {/* Data row (allow wrap) */}
                {computed.map((r, i) => (
                    <View key={i} style={styles.row} /* no wrap={false} */>
                        <Text style={[styles.cell, styles.c1]}>{i + 1}</Text>
                        <Text style={[styles.cell, styles.c2]}>{r.description}</Text>
                        <Text style={[styles.cell, styles.c3, styles.center]}>{r.class || "-"}</Text>
                        <Text style={[styles.cell, styles.c4]}>{r.company || "-"}</Text>
                        <Text style={[styles.cell, styles.c5, styles.center]}>{r.qty}</Text>
                        <Text style={[styles.cell, styles.c6, styles.num, { fontSize: numberFontSize(formatMoney(r.rate)) }]}>
                            {formatMoney(r.rate)}
                        </Text>
                        <Text style={[styles.cell, styles.c7, styles.num, { fontSize: numberFontSize(formatMoney(r.gross)) }]}>
                            {formatMoney(r.gross)}
                        </Text>
                        <Text style={[styles.cell, styles.c8, styles.center]}>{r.discountPercent || 0}%</Text>
                        <Text style={[styles.cell, styles.c9, styles.num, { fontSize: numberFontSize(formatMoney(r.discAmt)) }]}>
                            {formatMoney(r.discAmt)}
                        </Text>
                        <Text style={[styles.cell, styles.c10, styles.num, { fontSize: numberFontSize(formatMoney(r.net)) }]}>
                            {formatMoney(r.net)}
                        </Text>
                    </View>
                ))}

                {/* Totals */}
                <View style={[styles.row, styles.totalsRow]} wrap={false}>
                    <Text style={[styles.cell, styles.c1]} />
                    <Text style={[styles.cell, styles.c2]}>Totals</Text>
                    <Text style={[styles.cell, styles.c3]} />
                    <Text style={[styles.cell, styles.c4]} />
                    <Text style={[styles.cell, styles.c5, styles.center, { fontSize: numberFontSize(formatMoney(totals.qty)) }]}>{totals.qty}</Text>
                    <Text style={[styles.cell, styles.c6]} /> {/* rate not summed */}
                    <Text style={[styles.cell, styles.c7, styles.num, { fontSize: numberFontSize(formatMoney(totals.gross)) }]}>{formatMoney(totals.gross)}</Text>
                    <Text style={[styles.cell, styles.c8]} />
                    <Text style={[styles.cell, styles.c9, styles.num, { fontSize: numberFontSize(formatMoney(totals.disc)) }]}>{formatMoney(totals.disc)}</Text>
                    <Text style={[styles.cell, styles.c10, styles.num, { fontSize: numberFontSize(formatMoney(totals.net)) }]}>{formatMoney(totals.net)}</Text>
                </View>
                {/* </View> */}

                {/* Words */}
                <Text style={{ marginTop: 6 }}>
                    Amount in words: {numberToWords(totals.net)}
                </Text>

                {/* Bank + sign */}
                <View style={styles.bankWrap}>

                    <View style={styles.bankBox}>
                        <Text style={styles.bankTitle}>Bank Details</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Account</Text>
                            <Text style={styles.value}>: {settings?.name}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Bank</Text>
                            <Text style={styles.value}>: {settings?.bankName}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>A/C No</Text>
                            <Text style={styles.value}>: {settings?.accountNo}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>IFSC</Text>
                            <Text style={styles.value}>: {settings?.ifsc}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>UPI</Text>
                            <Text style={styles.value}>: {settings?.upi}</Text>
                        </View>
                    </View>

                    <View style={styles.signBox}>
                        <Text>For {settings?.name}</Text>
                        <Text style={styles.signLine}>Authorized Signatory</Text>
                        <Text>Recorded By: {data.billedBy}</Text>

                    </View>
                </View>

                <Text style={styles.footer}>Computer generated invoice</Text>
            </Page>
        </Document >
    );
}
