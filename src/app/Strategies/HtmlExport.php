<?php
    namespace App\Strategies;

    use App\Strategies\ExportStrategyInterface;
    use Parsedown;

    class HtmlExport implements ExportStrategyInterface {
        public function __construct(private readonly Parsedown $parser) { }

        public function export(string $content, string $title) : string {
            $real_content = $this->parser->text($content);  
            $html_content = '
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
            return $html_content;
        }


        public function contentType() : string {
            return 'text/html';
        }
        
        public function extension() : string{
            return 'html';
        
        }
    }
?>