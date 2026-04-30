<?php
    namespace App\Services;

    use App\Repositories\NoteRepositoryInterface;
    use App\Factories\ExportStrategyFactory;
    use App\Models\Note;

    class ExportService {

        //forse necessario esplicitare dipendenza factory per facilitare test
        //forse necessario avere strategy interface come attributo

        public function __construct (private readonly NoteRepositoryInterface $repo, 
            private readonly ExportStrategyFactory $factory) {}

        public function export(string $id, string $format): array {
            $note = $this->repo->get($id);
            $strategy = $this->factory->make($format);
            
            return [
                'content' => $strategy->export($note->getContent(), $note->getTitle()),
                'content_type' => $strategy->contentType(),
                'filename' => $note->getTitle() . '.' . $strategy->extension(),
            ];
        }

        public function exportRaw(string $title, string $content, string $format): array {
            $strategy = $this->factory->make($format);
            
            return [
                'content' => $strategy->export($content, $title),
                'content_type' => $strategy->contentType(),
                'filename' => $title . '.' . $strategy->extension(),
            ];
        }
    }
?>