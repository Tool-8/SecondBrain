<?php
    namespace Tests\Feature;

    use App\Services\ExportService;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str;
    use Tests\TestCase;
    use RuntimeException;

    class ExportTest extends TestCase {

        protected function setUp(): void {
            parent::setUp();
            Storage::fake('local');
        }

        public function test_export_md() {

            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\nContenuto"
            );

            $response = $this->getJson("/api/notes/{$id}/export?format=md");

            $response->assertStatus(200)
                ->assertHeader('Content-Type', 'text/markdown; charset=utf-8')
                ->assertHeader('Content-Disposition', 'attachment; filename="Titolo.md"');

            $this->assertSame('Contenuto', $response->getContent());
        }

        public function test_export_html() {

            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\n# Contenuto"
            );

            $response = $this->getJson("/api/notes/{$id}/export?format=html");

            $response->assertStatus(200)
                ->assertHeader('Content-Type', 'text/html; charset=utf-8')
                ->assertHeader('Content-Disposition', 'attachment; filename="Titolo.html"');

            $this->assertStringContainsString('<h1>Contenuto</h1>', $response->getContent());
            
        }

        public function test_export_pdf() {

            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\nContenuto"
            );

            $response = $this->getJson("/api/notes/{$id}/export?format=pdf");

            $response->assertStatus(200)
                ->assertHeader('Content-Type', 'application/pdf')
                ->assertHeader('Content-Disposition', 'attachment; filename="Titolo.pdf"');

            $this->assertStringStartsWith('%PDF', $response->getContent()); 
        }

        public function test_invalid_export_format(){
            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\nContenuto"
            );

            $response = $this->getJson("/api/notes/{$id}/export?format=mdma");
            
            $response->assertStatus(400)->assertJsonFragment(['message' => 'Unknown format: mdma']);
        }

        public function test_note_not_found_on_export(){
            $id = (string) Str::uuid();

            $response = $this->getJson("/api/notes/{$id}/export?format=html");
            
            $response->assertStatus(404)->assertJsonFragment(['message' => 'Note not found']);
        }

        public function test_invalid_id_on_export(){
            $response = $this->getJson("/api/notes/123/export?format=html");
            
            $response->assertStatus(400)->assertJsonFragment(['message' => 'Invalid note id']);
        }

        public function test_internal_server_error(){
            $id = (string) Str::uuid();
            
            $this->mock(ExportService::class)
                ->shouldReceive('export')
                ->andThrow(new RuntimeException());

            $response = $this->getJson("/api/notes/{$id}/export?format=html");
            
            $response->assertStatus(500)->assertJsonFragment(['message' => 'Server error']);
        }
    }   

?>
