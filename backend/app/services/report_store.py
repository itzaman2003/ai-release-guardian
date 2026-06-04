from ..mock_data import build_mock_report
from ..schemas import AnalysisReport, DashboardSummary, GateStatus


class ReportStore:
    def __init__(self) -> None:
        self._reports: list[AnalysisReport] = []

    def add(self, report: AnalysisReport) -> AnalysisReport:
        self._reports = [item for item in self._reports if item.id != report.id]
        self._reports.insert(0, report)
        return report

    def list(self, limit: int = 10) -> list[AnalysisReport]:
        if not self._reports:
            return [build_mock_report("https://github.com/demo/ai-release-guardian/pull/42")]
        return self._reports[:limit]

    def get(self, report_id: str) -> AnalysisReport | None:
        return next((report for report in self.list(limit=50) if report.id == report_id), None)

    def summary(self) -> DashboardSummary:
        reports = self.list(limit=50)
        return DashboardSummary(
            total_reports=len(reports),
            blocked_releases=sum(1 for report in reports if report.quality_gate == GateStatus.fail),
            warning_releases=sum(1 for report in reports if report.quality_gate == GateStatus.warn),
            passing_releases=sum(1 for report in reports if report.quality_gate == GateStatus.pass_),
            latest_report=reports[0] if reports else None,
        )


report_store = ReportStore()
