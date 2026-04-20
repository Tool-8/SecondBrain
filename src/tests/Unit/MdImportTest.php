<?php

    namespace Tests\Unit;

    use App\Strategies\MdImport;
    use Illuminate\Http\UploadedFile;
    use PHPUnit\Framework\TestCase;

    class MdImportTest extends TestCase {
        private MdImport $strategy;

        protected function setUp(): void {
            parent::setUp();
            $this->strategy = new MdImport();
        }

        public function test_returns_filename_as_title_and_file_content_as_content(): void {
            $file = UploadedFile::fake()->createWithContent(
                'my-document.md',
                '# Hello World'
            );

            $result = $this->strategy->parse($file);

            $this->assertIsArray($result);
            $this->assertArrayHasKey('title', $result);
            $this->assertArrayHasKey('content', $result);

            $this->assertSame('my-document', $result['title']);
            $this->assertSame('# Hello World', $result['content']);
        }
    }

?>