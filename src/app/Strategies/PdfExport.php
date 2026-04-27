<?php
    namespace App\Strategies;

    use App\Strategies\ExportStrategyInterface;
    use Barryvdh\DomPDF\Facade\Pdf;
    use Parsedown;

    class PdfExport implements ExportStrategyInterface {
        public function __construct(private readonly Parsedown $parser){ }
        
        public function export(string $content, string $title) : string {
            $real_content = $this->parser->text($content);  
            $html = '
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <title>' .   $title  . '</title>
            </head>
            <body>
                ' . $real_content . '
            </body>
            </html>
            ';
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