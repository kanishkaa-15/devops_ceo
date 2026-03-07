import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export function ExportMenu({ data }: { data: any }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();
            const dateStr = format(new Date(), 'MMM dd, yyyy HH:mm');

            // Header
            doc.setFontSize(22);
            doc.setTextColor(15, 23, 42); // slate-900
            doc.text('Institutional Health Executive Report', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`Generated on: ${dateStr}`, 14, 28);
            doc.text(`Classification: CONFIDENTIAL`, 14, 33);

            // Fetch Current Top-Level Stats (passed down from parent dashboard)
            const { stats, healthData } = data;

            // Overall Vitality Section
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text('1. Operational Velocity Metrics', 14, 45);

            const overviewData = [
                ['Total Students', stats.studentsCount.toString()],
                ['Total Staff', stats.staffCount.toString()],
                ['Admissions Volume', stats.admissionsCount.toString()],
                ['Active Queries', stats.queriesCount.toString()],
            ];

            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: overviewData,
                theme: 'striped',
                headStyles: { fillColor: [56, 189, 248] }, // sky-400
            });

            // Institutional Health Index Section
            let nextY = (doc as any).lastAutoTable.finalY + 15;
            doc.text('2. Institutional Health Index (IHI)', 14, nextY);

            if (healthData && healthData.currentHealth) {
                const IHIbody = [
                    ['Overall Health Score', `${healthData.currentHealth.overall} / 100`, `${healthData.currentHealth.riskLevel} RISK`],
                    ['Academic Health', `${healthData.currentHealth.academic}`, `${healthData.deltas.academic > 0 ? '+' : ''}${healthData.deltas.academic}%`],
                    ['Financial / Operational', `${healthData.currentHealth.financial}`, `${healthData.deltas.financial > 0 ? '+' : ''}${healthData.deltas.financial}%`],
                    ['Student Wellbeing', `${healthData.currentHealth.wellbeing}`, `${healthData.deltas.wellbeing > 0 ? '+' : ''}${healthData.deltas.wellbeing}%`],
                    ['Staff Efficiency', `${healthData.currentHealth.efficiency}`, `${healthData.deltas.efficiency > 0 ? '+' : ''}${healthData.deltas.efficiency}%`],
                ];

                autoTable(doc, {
                    startY: nextY + 5,
                    head: [['Vector', 'Score (100)', 'MoM Delta']],
                    body: IHIbody,
                    theme: 'grid',
                    headStyles: { fillColor: [139, 92, 246] }, // violet-500
                    columnStyles: {
                        2: { fontStyle: 'bold' } // Emphasize deltas
                    }
                });
            }

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // slate-400
                doc.text(
                    `Page ${i} of ${pageCount} - Quantum Intelligence Suite`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            doc.save(`Executive_Briefing_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF report:', error);
            alert('An error occurred while generating the Executive Report.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="h-11 px-6 rounded-2xl gap-2 border-primary/20 bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
        >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isExporting ? 'Compiling Vector...' : 'Generate Executive Report'}
        </Button>
    );
}
