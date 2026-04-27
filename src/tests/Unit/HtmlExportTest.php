<?php
    namespace Tests\Unit;

    use Tests\TestCase;
    use App\Strategies\HtmlExport;
    use Parsedown;

    class HtmlExportTest extends TestCase {
        private HtmlExport $strategy;

        protected function setUp(): void {
            parent::setUp();
            $this->strategy = new HtmlExport(new Parsedown());
        }

        public function test_export_returns_content() : void {
            $content = "# Prova";
            $html_content = "
            <!DOCTYPE html>
            <html lang=\"it\">
            <head>
                <meta charset=\"UTF-8\">
                <title>Titolo Nota</title>
            </head>
            <body>
                <h1>Prova</h1>
            </body>
            </html>
            ";
            $result = $this->strategy->export($content, 'Titolo Nota');
            $this->assertSame($html_content, $result);
        }

        public function test_export_returns_empty_body_with_no_content() : void {
            $content = "";
            $html_content = "
            <!DOCTYPE html>
            <html lang=\"it\">
            <head>
                <meta charset=\"UTF-8\">
                <title>Titolo Nota</title>
            </head>
            <body>
                " . $content . "
            </body>
            </html>
            ";
            $result = $this->strategy->export($content, 'Titolo Nota');
            $this->assertSame($html_content, $result);
        }



        public function test_content_type_html() : void {
            $content_type = "text/html";
            $result = $this->strategy->contentType();

            $this->assertSame($content_type, $result);
        }

        public function test_extension_html() : void {
            $extension = "html";
            $result = $this->strategy->extension();

            $this->assertSame($extension, $result);
        }
    }
?>