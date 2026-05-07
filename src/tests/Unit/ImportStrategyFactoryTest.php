<?php
    namespace Tests\Unit;

    use App\Factories\ImportStrategyFactory;
    use App\Strategies\MdImport;
    use Tests\TestCase;
    use InvalidArgumentException;

    class ImportStrategyFactoryTest extends TestCase {
        
        private ImportStrategyFactory $factory;

        protected function setUp(): void {
            parent::setUp();
            $this->factory = new ImportStrategyFactory();
        }

        public function test_return_markdown_import_strategy_istance() {
            $this->assertInstanceOf(MdImport::class, $this->factory->make('md'));
        }

        public function test_throws_exception_with_invalid_format() {
            $this->expectException(InvalidArgumentException::class);
            $this->expectExceptionMessage("xml format is not supported");

            $this->factory->make('xml');

        }
    }
?>