<?php
    namespace App\Strategies;

    use App\Strategies\ExportStrategyInterface;
    use App\Utilities\EditorContentFormatter;
    use Barryvdh\DomPDF\Facade\Pdf;
    use Parsedown;

    class PdfExport implements ExportStrategyInterface {
        public function __construct(
            private readonly Parsedown $parser,
            private readonly EditorContentFormatter $formatter
        ) {}
        
        public function export(string $content, string $title): string
        {
            $markdown = $this->formatter->htmlToMarkdown($content);
            $real_content = $this->parser->text($markdown);

            $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');

            $html = '
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <title>' . $safeTitle . '</title>
                <style>
                    body {
                        font-family: DejaVu Sans, sans-serif;
                    }
                </style>
            </head>
            <body>
                ' . $real_content . '
            </body>
            </html>';

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