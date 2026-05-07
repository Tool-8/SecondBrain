<?php
    namespace Tests\Feature;

    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str;
    use Tests\TestCase;
    use App\Repositories\NoteRepository;
    use RuntimeException;

    class NoteTest extends TestCase {

        protected function setUp(): void {
            parent::setUp();
            Storage::fake('local');
        }

        public function test_create_note() {
            $response = $this->postJson('/api/notes', [
                'title' => 'Titolo',
                'content_md' => '# Contenuto'
            ]);

            $response2 = $this->postJson('/api/notes', [
                'title' => 'Titolo2',
                'content_md' => '# Contenuto'
            ]);

            $note1 = $response->assertStatus(201)->json();
            $note2 = $response2->assertStatus(201)->json();

            $files = Storage::disk('local')->files('notes');
            $this->assertCount(2, $files);
            Storage::disk('local')->assertExists("notes/{$note1['id']}.md");
            Storage::disk('local')->assertExists("notes/{$note2['id']}.md");
        }
        
        public function test_list_notes() {

            Storage::disk('local')->put(
                'notes/test.md',
                'prova'
            );

            $response = $this->getJson('/api/notes');

            $response->assertStatus(200)->assertJsonCount(1);
        }

        public function test_get_a_note() {
            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\nContenuto"
            );

            $response = $this->getJson("/api/notes/{$id}");

            $response->assertStatus(200);
            $response->assertJsonFragment(['content_md' => 'Contenuto']);
            $response->assertJsonFragment(['title' => 'Titolo']);
            $response->assertJsonFragment(['id' => $id]);
        }

        public function test_delete_a_note() {
            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\nContenuto"
            );
            Storage::disk('local')->assertExists("notes/{$id}.md");

            $response = $this->deleteJson("/api/notes/{$id}");

            $response->assertStatus(204);
            Storage::disk('local')->assertMissing("notes/{$id}.md");
        }

        public function test_update_a_note() {
            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\nContenuto"
            );

            $response = $this->putJson("api/notes/{$id}", [
                "title" => "Titolo modificato",
                "content_md" => "Content modificato"
            ]);
        
            $response->assertStatus(200);
            $response->assertJsonFragment(['content_md' => 'Content modificato']);
            $response->assertJsonFragment(['title' => 'Titolo modificato']);
            $response->assertJsonFragment(['id' => $id]);
        }

        public function test_note_not_found() {
            $id = (string) Str::uuid();
            $response = $this->getJson("/api/notes/{$id}");
            
            $response->assertStatus(404)->assertJsonFragment(['message' => 'Note not found']);
        }
        
        public function test_invalid_id() {
            $response = $this->getJson("/api/notes/69420");
            
            $response->assertStatus(400)->assertJsonFragment(['message' => 'Invalid note id']);
        }

        public function test_duplicate_titles_error() {
            $this->postJson('api/notes', [
                'title' => 'Titolo',
                'content_md' => 'A'
            ]);

            $response = $this->postJson('/api/notes', [
                'title' => 'Titolo',
                'content_md' => 'B'
            ]);

            $response->assertStatus(409)->assertJsonFragment(['message' => 'Title already used']);
        }

        public function test_delete_failed() {
            $id = (string) Str::uuid();

            Storage::disk('local')->put(
                "notes/{$id}.md",
                "---\nid: $id\ntitle: \"Titolo\"\n---\n\nContenuto"
            );
            
            $this->mock(NoteRepository::class)
                ->shouldReceive('delete')
                ->andThrow(new RuntimeException("DELETE_FAILED"));

            $response = $this->deleteJson("/api/notes/{$id}");

            $response->assertStatus(500)->assertJsonFragment(['message' => 'Failed to delete']);
            
        }
    }
?>