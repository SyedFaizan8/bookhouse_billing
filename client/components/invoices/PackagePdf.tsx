// import { SettingsInfoResponse } from "@/lib/queries/settings";
// import { InvoicePdfData, Item } from "@/lib/types/invoice";
// import { formatMoney } from "@/lib/utils/formatters";
// import {
//     Document,
//     Page,
//     Text,
//     View,
//     StyleSheet,
//     Image,
//     Font,
// } from "@react-pdf/renderer";

// /* ================= FONT REGISTRATION ================= */

// Font.register({
//     family: "Mono",
//     fonts: [
//         { src: "/fonts/JetBrainsMono-Regular.ttf", fontWeight: 400 },
//         { src: "/fonts/JetBrainsMono-Bold.ttf", fontWeight: 700 },
//     ],
// });

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//     page: {
//         padding: 36,
//         fontSize: 10,
//         fontFamily: "Mono",
//         color: "#0f172a",
//     },

//     bold: { fontWeight: 700 },
//     text: { fontSize: 10, color: "#0f172a" },
//     muted: { fontSize: 9, color: "#475569" },

//     /* ================= HEADER ================= */

//     rowBetween: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 8,
//         fontSize: 9,
//     },

//     header: {
//         alignItems: "center",
//         marginBottom: 12,
//     },

//     logo: {
//         height: 52,
//         marginBottom: 6,
//     },

//     title: {
//         fontSize: 18,
//         fontWeight: 700,
//         letterSpacing: 0.5,
//         color: "#1e3a8a",
//     },

//     companyInfo: {
//         marginTop: 2,
//         textAlign: "center",
//         fontSize: 9,
//         color: "#475569",
//         lineHeight: 1.4,
//     },

//     badge: {
//         alignSelf: "center",
//         marginVertical: 10,
//         paddingVertical: 4,
//         paddingHorizontal: 20,
//         borderRadius: 20,
//         fontSize: 10,
//         fontWeight: 700,
//         border: "1px solid #6366f1",
//         color: "#3730a3",
//     },

//     /* ================= CUSTOMER ================= */

//     box: {
//         border: "1px solid #e5e7eb",
//         padding: 10,
//         borderRadius: 6,
//         marginBottom: 14,
//         backgroundColor: "#fafafa",
//     },

//     sectionTitle: {
//         fontWeight: 700,
//         fontSize: 10,
//         textDecoration: "underline",
//         marginBottom: 4,
//     },

//     /* ================= TABLE ================= */

//     tableHeader: {
//         flexDirection: "row",
//         borderTop: "1px solid #000",
//         borderBottom: "1px solid #000",
//         backgroundColor: "#f8fafc",
//         paddingVertical: 6,
//         fontWeight: 700,
//     },

//     row: {
//         flexDirection: "row",
//         borderBottom: "1px solid #e5e7eb",
//         paddingVertical: 6,
//         wrap: false, // VERY IMPORTANT (no row split)
//     },

//     cellSl: { width: 28, textAlign: "center" },

//     cellDesc: {
//         width: 200, // adjusted
//         paddingRight: 6,
//     },

//     cellClass: {
//         width: 45,
//         textAlign: "center",
//     },

//     cellCompany: {
//         width: 120,
//         paddingRight: 6,
//     },

//     cellQty: {
//         width: 45,
//         textAlign: "center",
//         fontWeight: 600,
//     },

//     /* ⭐ NEW COLUMN */
//     cellPending: {
//         width: 55,
//         textAlign: "center",
//         fontWeight: 700,
//         color: "#b91c1c",
//     },

//     cellMrp: {
//         width: 90,
//         textAlign: "right",
//         fontFamily: "Mono",
//         fontSize: 9,
//     },

//     /* ================= FOOTER ================= */

//     footerNote: {
//         marginTop: 18,
//         textAlign: "center",
//         fontSize: 9,
//         color: "#64748b",
//     },
// });

// /* ================= COMPONENT ================= */

// export default function PackagePdf({
//     data,
//     settings,
// }: {
//     data: InvoicePdfData;
//     settings: SettingsInfoResponse;
// }) {

//     console.log(data.items)
//     return (
//         <Document>
//             <Page size="A4" style={styles.page} wrap>
//                 {/* HEADER */}
//                 <View style={styles.rowBetween}>
//                     <Text>Package No: {data.documentNo}</Text>
//                     <Text>
//                         {new Date(data.date).toLocaleDateString("en-IN", {
//                             day: "2-digit",
//                             month: "long",
//                             year: "numeric",
//                         })}
//                     </Text>
//                 </View>

//                 <View style={styles.header}>
//                     {settings?.logoUrl && (
//                         <Image
//                             src={settings.logoUrl}
//                             style={styles.logo}
//                         />
//                     )}

//                     <Text style={styles.title}>
//                         {settings?.name?.toUpperCase()}
//                     </Text>

//                     {/* Address */}
//                     {(settings?.street ||
//                         settings?.town ||
//                         settings?.district ||
//                         settings?.state ||
//                         settings?.pincode) && (
//                             <Text style={styles.companyInfo}>
//                                 {[
//                                     settings.street,
//                                     settings.town,
//                                     settings.district,
//                                     settings.state,
//                                     settings.pincode,
//                                 ]
//                                     .filter(Boolean)
//                                     .join(", ")}
//                             </Text>
//                         )}

//                     {/* Contact */}
//                     <Text style={styles.companyInfo}>
//                         Phone: {settings?.phone}
//                         {settings?.phoneSecondary && `, ${settings.phoneSecondary}`}
//                         {settings?.phoneTertiary && `, ${settings.phoneTertiary}`}
//                     </Text>

//                     {/* Email */}
//                     {settings?.email && (
//                         <Text style={styles.companyInfo}>
//                             Email: {settings.email}
//                         </Text>
//                     )}

//                     {/* GST */}
//                     {settings?.gst && (
//                         <Text style={styles.companyInfo}>
//                             GSTIN: {settings.gst}
//                         </Text>
//                     )}
//                 </View>


//                 <Text style={styles.badge}>
//                     PACKAGE NOTE
//                 </Text>

//                 {/* SCHOOL */}
//                 <View style={styles.box}>
//                     <Text style={styles.sectionTitle}>To</Text>

//                     <Text style={styles.bold}>
//                         {data.school.name}
//                     </Text>

//                     {data.school.contactPerson && (
//                         <Text>
//                             Attn: {data.school.contactPerson}
//                         </Text>
//                     )}

//                     {(data.school.street ||
//                         data.school.town ||
//                         data.school.district ||
//                         data.school.state ||
//                         data.school.pincode) && (
//                             <Text>
//                                 {[
//                                     data.school.street,
//                                     data.school.town,
//                                     data.school.district,
//                                     data.school.state,
//                                     data.school.pincode,
//                                 ]
//                                     .filter(Boolean)
//                                     .join(", ")}
//                             </Text>
//                         )}

//                     <Text>
//                         Phone: {data.school.phone}
//                     </Text>

//                     {data.school.email && (
//                         <Text>
//                             Email: {data.school.email}
//                         </Text>
//                     )}

//                     {data.school.gst && (
//                         <Text>
//                             GSTIN: {data.school.gst}
//                         </Text>
//                     )}
//                 </View>


//                 {/* ================= TABLE ================= */}

//                 {/* HEADER */}
//                 < View style={styles.tableHeader} fixed >
//                     <Text style={styles.cellSl}>#</Text>
//                     <Text style={styles.cellDesc}>Description</Text>
//                     <Text style={styles.cellClass}>Class</Text>
//                     <Text style={styles.cellCompany}>Company</Text>
//                     <Text style={styles.cellQty}>Qty</Text>

//                     {/* ⭐ NEW */}
//                     < Text style={styles.cellPending} > Pending</Text>

//                     <Text style={styles.cellMrp}>MRP</Text>
//                 </View>

//                 {/* ROWS */}
//                 {data.items.map((r: Item, idx) => (
//                     <View key={idx} style={styles.row} wrap={false}>
//                         <Text style={styles.cellSl}>{idx + 1}</Text>
//                         <Text style={styles.cellDesc}>{r.description}</Text>
//                         <Text style={styles.cellClass}>{r.class || "-"}</Text>
//                         <Text style={styles.cellCompany}>{r.company || "-"}</Text>
//                         <Text style={styles.cellQty}>{r.quantity}</Text>

//                         {/* ⭐ NEW */}
//                         <Text style={styles.cellPending}>
//                             {r.pending ?? 0}
//                         </Text>

//                         <Text style={styles.cellMrp}>
//                             {formatMoney(r.rate)}
//                         </Text>
//                     </View>
//                 ))}

//                 <Text style={styles.footerNote}>
//                     This is a computer-generated document
//                 </Text>
//             </Page>
//         </Document>
//     );
// }

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
    family: "Mono",
    fonts: [
        { src: "/fonts/JetBrainsMono-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/JetBrainsMono-Bold.ttf", fontWeight: 700 },
    ],
});

/* ======================================================
   STYLES (INVOICE THEME APPLIED)
====================================================== */

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontFamily: "Mono",
        fontSize: 7,
        color: "#0f172a",
    },

    /* ================= HEADER ================= */

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 8,
        marginBottom: 6,
    },

    gstHeader: {
        fontWeight: 700
    },

    companyName: {
        fontSize: 24,
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
        fontSize: 8,
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
        fontSize: 7,
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
        fontSize: 9,
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
        fontSize: 9,
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
        fontSize: 7,
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
                {data.status === "VOIDED" && (
                    <Text style={styles.watermark}>VOIDED</Text>
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
