<?php
    namespace Tests\Feature;

    use App\Services\ImportService;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str;
    use Tests\TestCase;
    use RuntimeException;
    use Illuminate\Http\UploadedFile;

    class ImportTest extends TestCase {

        protected function setUp(): void {
            parent::setUp();
            Storage::fake('local');
        }

        public function test_import_md(){
            $now = now();
            $timestamp = $now->format('Y-m-d H:i:s');

            $this->travelTo($now); //freeze time

            $file = UploadedFile::fake()->createWithContent(
                'Test.md', 
                '# Contenuto');
            
            $response = $this->postJson('/api/notes/import', [
                'file' => $file
            ]);

            $response->assertStatus(201)
                ->assertJsonFragment([
                    'title' => "Test - $timestamp",
                    'content_md' => '# Contenuto',
                    'created_at' => $now->toIso8601String(), 
                    'updated_at' => $now->toIso8601String()]);
            
            $this->travelBack();
        }

        public function test_returns_400_on_import_whit_invalid_format(){
            $file = UploadedFile::fake()->createWithContent(
                'Test.mdma', 
                '# Contenuto');
            
            $response = $this->postJson('/api/notes/import', [
                'file' => $file
            ]);

            $response->assertStatus(400)
                ->assertJsonFragment(['message' => 'mdma format is not supported']);
        }

        public function test_returns_400_on_import_whit_title_already_used(){
            $now = now();

            $this->travelTo($now); //freeze time

            $file = UploadedFile::fake()->createWithContent(
                'Test.md', 
                '# Contenuto');
            
            $this->postJson('/api/notes/import', [
                'file' => $file
            ]);
            $response2 = $this->postJson('/api/notes/import', [
                'file' => $file
            ]);


            $response2->assertStatus(400)
                ->assertJsonFragment(['message' => 'Title already used by another note']);
            
            $this->travelBack();

        }

        public function test_returns_500_on_import_whit_internal_error(){
            $file = UploadedFile::fake()->createWithContent(
                'Test.md', 
                '# Contenuto');

            $this->mock(ImportService::class)
                ->shouldReceive('handleUpload')
                ->andThrow(new RuntimeException());
            
            $response = $this->postJson('/api/notes/import', [
                'file' => $file
            ]);

            $response->assertStatus(500)
                ->assertJsonFragment(['message' => 'Server error']);
        }

        public function test_returns_422_when_file_exceeds_max_size(){
            $file = UploadedFile::fake()->create('Test.md', 11000);

            $response = $this->postJson('api/notes/import', [
                'file' => $file
            ]);

            $response->assertStatus(422)
                ->assertJsonFragment(['errors' => ['file' => ['File size must not exceed 10240 KB']]]);
        }
    }