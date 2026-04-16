<?php
    namespace Tests\Unit;

    use Tests\TestCase;
    use App\Strategies\PdfExport;

    class PdfExportTest extends TestCase {
        private PdfExport $strategy;

        protected function setUp(): void {
            parent::setUp();
            $this->strategy = new PdfExport();
        }

        public function test_export_returns_content() : void {
            $content = "# Prova";
            $result = $this->strategy->export($content, 'Titolo Nota');

            $this->assertStringStartsWith("%PDF", $result);
        }

        public function test_content_type_pdf() : void {
            $content_type = "application/pdf";
            $result = $this->strategy->contentType();

            $this->assertSame($content_type, $result);
        }

        public function test_extension_pdf() : void {
            $extension = "pdf";
            $result = $this->strategy->extension();

            $this->assertSame($extension, $result);
        }
    }
?>