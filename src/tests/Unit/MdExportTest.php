<?php
    namespace Tests\Unit;

    use Tests\TestCase;
    use App\Strategies\MdExport;

    class MdExportTest extends TestCase {
        private MdExport $strategy;

        protected function setUp(): void {
            parent::setUp();
            $this->strategy = new MdExport();
        }

        public function test_export_returns_content() : void {
            $content = "# Prova";
            $result = $this->strategy->export($content, 'Titolo Nota');

            $this->assertSame($content, $result);
        }

        public function test_export_returns_empty_content() : void {
            $content = "";
            $result = $this->strategy->export($content, 'Titolo Nota');

            $this->assertSame($content, $result);
        }

        public function test_content_type_markdown() : void {
            $content_type = "text/markdown";
            $result = $this->strategy->contentType();

            $this->assertSame($content_type, $result);
        }

        public function test_extension_markdown() : void {
            $extension = "md";
            $result = $this->strategy->extension();

            $this->assertSame($extension, $result);
        }
    }
?>