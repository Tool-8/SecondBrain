<?php
    namespace App\Repositories;

    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str;
    use RuntimeException;

    class NoteRepository implements NoteRepositoryInterface
    {
        private const DIR = 'notes';
        private const EXT = 'md';

        public function list(): array
        {
            $this->ensureDir();

            $files = Storage::disk('local')->files(self::DIR);
            $notes = [];

            foreach ($files as $file) {
                if (!str_ends_with($file, '.' . self::EXT)) {
                    continue;
                }

                $raw = Storage::disk('local')->get($file);
                [$meta, $_content] = $this->parseFile($raw);

                $id = $meta['id'] ?? $this->idFromPath($file);
                $title = $meta['title'] ?? $this->fallbackTitle($raw, $id);

                $notes[] = [
                    'id'         => $id,
                    'title'      => $title,
                    'created_at' => $meta['created_at'] ?? null,
                    'updated_at' => $meta['updated_at'] ?? null,
                ];
            }

            usort($notes, function ($a, $b) {
                return strcmp($b['updated_at'] ?? '', $a['updated_at'] ?? '');
            });

            return $notes;
        }

        public function get(string $id): array
        {
            $this->assertValidId($id);
            $this->ensureDir();

            $path = $this->pathForId($id);
            if (!Storage::disk('local')->exists($path)) {
                throw new RuntimeException('NOT_FOUND');
            }

            $raw = Storage::disk('local')->get($path);
            [$meta, $content] = $this->parseFile($raw);

            return [
                'id'         => $meta['id'] ?? $id,
                'title'      => $meta['title'] ?? $this->fallbackTitle($raw, $id),
                'created_at' => $meta['created_at'] ?? null,
                'updated_at' => $meta['updated_at'] ?? null,
                'content_md' => $content,
            ];
        }

        public function create(string $title, string $contentMd): array
        {
            $this->ensureDir();

            $id  = (string) Str::uuid();
            $now = now()->toIso8601String();

            $meta = [
                'id'         => $id,
                'title'      => $title,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            Storage::disk('local')->put($this->pathForId($id), $this->buildFile($meta, $contentMd));

            return [
                'id'         => $id,
                'title'      => $title,
                'created_at' => $now,
                'updated_at' => $now,
                'content_md' => $contentMd,
            ];
        }

        public function update(string $id, string $title, string $contentMd): array
        {
            $this->assertValidId($id);
            $this->ensureDir();

            $path = $this->pathForId($id);
            if (!Storage::disk('local')->exists($path)) {
                throw new RuntimeException('NOT_FOUND');
            }

            // legge created_at originale per non perderlo
            $raw = Storage::disk('local')->get($path);
            [$oldMeta] = $this->parseFile($raw);
            $createdAt = $oldMeta['created_at'] ?? now()->toIso8601String();

            $now  = now()->toIso8601String();
            $meta = [
                'id'         => $id,
                'title'      => $title,
                'created_at' => $createdAt,
                'updated_at' => $now,
            ];

            Storage::disk('local')->put($path, $this->buildFile($meta, $contentMd));

            return [
                'id'         => $id,
                'title'      => $title,
                'created_at' => $createdAt,
                'updated_at' => $now,
                'content_md' => $contentMd,
            ];
        }

        public function isTitleUsed(string $title, ?string $excludeId = null): bool
        {
            foreach ($this->list() as $note) {
                if (mb_strtolower($note['title']) === mb_strtolower($title) && $note['id'] !== $excludeId) {
                    return true;
                }
            }
            return false;
        }

        public function delete(string $id): void
        {
            $this->assertValidId($id);
            $this->ensureDir();

            $path = $this->pathForId($id);
            if (!Storage::disk('local')->exists($path)) {
                throw new RuntimeException('NOT_FOUND');
            }
            
            if (!Storage::disk('local')->delete($path)) {
                throw new RuntimeException("DELETE_FAILED");
            }
        }

        private function ensureDir(): void
        {
            if (!Storage::disk('local')->exists(self::DIR)) {
                Storage::disk('local')->makeDirectory(self::DIR);
            }
        }

        private function pathForId(string $id): string
        {
            return self::DIR . '/' . $id . '.' . self::EXT;
        }

        private function idFromPath(string $path): string
        {
            $base = basename($path);
            return preg_replace('/\.' . preg_quote(self::EXT, '/') . '$/', '', $base) ?: $base;
        }

        private function assertValidId(string $id): void
        {
            if (!preg_match('/^[0-9a-fA-F-]{36}$/', $id)) {
                throw new RuntimeException('INVALID_ID');
            }
        }

        private function parseFile(string $raw): array
        {
            $raw = ltrim($raw, "\xEF\xBB\xBF");

            if (!str_starts_with($raw, "---\n")) {
                return [[], $raw];
            }

            $end = strpos($raw, "\n---\n", 4);
            if ($end === false) {
                return [[], $raw];
            }

            $front   = substr($raw, 4, $end - 4);
            $content = ltrim(substr($raw, $end + 5), "\n");

            return [$this->parseFrontMatter($front), $content];
        }

        private function parseFrontMatter(string $front): array
        {
            $meta  = [];
            $lines = preg_split("/\r\n|\n|\r/", trim($front)) ?: [];

            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) continue;

                $pos = strpos($line, ':');
                if ($pos === false) continue;

                $key = trim(substr($line, 0, $pos));
                $val = trim(trim(substr($line, $pos + 1)), "\"'");

                if ($key !== '') {
                    $meta[$key] = $val;
                }
            }

            return $meta;
        }

        private function buildFile(array $meta, string $contentMd): string
        {
            $front  = "---\n";
            $front .= "id: "         . ($meta['id']         ?? '') . "\n";
            $front .= "title: \""    . ($meta['title']       ?? '') . "\"\n";
            $front .= "created_at: \"" . ($meta['created_at'] ?? '') . "\"\n";
            $front .= "updated_at: \"" . ($meta['updated_at'] ?? '') . "\"\n";
            $front .= "---\n\n";

            return $front . $contentMd . "\n";
        }

        private function fallbackTitle(string $raw, string $id): string
        {
            foreach (preg_split("/\r\n|\n|\r/", $raw) as $line) {
                $line = trim($line);
                if (preg_match('/^#\s+(.+)$/', $line, $m)) {
                    return trim($m[1]);
                }
            }
            return 'Note ' . substr($id, 0, 8);
        }
    }
?>