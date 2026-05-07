<?php
    namespace Tests\Unit;

    use InvalidArgumentException;
    use Tests\TestCase;
    use App\Factories\ExportStrategyFactory;
    use App\Strategies\MdExport;
    use App\Strategies\HtmlExport;
    use App\Strategies\PdfExport;

    class ExportStrategyFactoryTest extends TestCase {

        private ExportStrategyFactory $factory;

        protected function setUp(): void {
            parent::setUp();
            $this->factory = new ExportStrategyFactory();
        }

        public function test_return_markdown_strategy_istance() {
            $this->assertInstanceOf(MdExport::class, $this->factory->make('md'));
        }
        
        public function test_return_html_strategy_istance() {
            $this->assertInstanceOf(HtmlExport::class, $this->factory->make('html'));
        }

        public function test_return_pdf_strategy_istance() {
            $this->assertInstanceOf(PdfExport::class, $this->factory->make('pdf'));
        }
        
        public function test_throws_exception_with_invalid_format() {
            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage("Unknown format: xml");

            $this->factory->make('xml');
        }
    }
?>