<?php
    namespace Tests\Unit;

    use InvalidArgumentException;
    use Tests\TestCase;
    use App\Factories\ExportStrategyFactory;
    use App\Strategies\MdExport;
    use App\Strategies\HtmlExport;
    use App\Strategies\PdfExport;

    class ExportStrategyFactoryTest extends TestCase {
       
        protected function setUp(): void {
            parent::setUp();
        }

        public function test_return_markdown_strategy_istance() {
            $this->assertInstanceOf(MdExport::class, ExportStrategyFactory::make('md'));
        }
        
        public function test_return_html_strategy_istance() {
            $this->assertInstanceOf(HtmlExport::class, ExportStrategyFactory::make('html'));
        }

        public function test_return_pdf_strategy_istance() {
            $this->assertInstanceOf(PdfExport::class, ExportStrategyFactory::make('pdf'));
        }
        
        public function test_throws_exception_with_invalid_format() {
            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage("Unknown format: xml");

            ExportStrategyFactory::make('xml');
        }
    }
?>