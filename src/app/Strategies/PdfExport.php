<?php
    namespace App\Strategies;

    use App\Strategies\ExportStrategyInterface;
    use App\Strategies\HtmlExport;
    use Barryvdh\DomPDF\Facade\Pdf;

    class PdfExport implements ExportStrategyInterface {
        public function export(string $content, string $title) : string {
            $html = (new HtmlExport)->export($content, $title);
            return Pdf::loadHTML($html)->output();
        }

        public function contentType() : string {
            return 'application/pdf';
        }
        
        public function extension() : string{
            return 'pdf';
        }
    }
?>