<?php
    namespace App\Services;

    use App\Repositories\NoteRepositoryInterface;
    use App\Factories\ExportStrategyFactory;
    use App\Strategies\ExportStrategyInterface;

    class ExportService {

        //forse necessario esplicitare dipendenza factory per facilitare test
        //forse necessario avere strategy interface come attributo

        public function __construct (private readonly NoteRepositoryInterface $repo) {}

        public function export(string $id, string $format) {
            $note = $this->repo->get($id);
            $strategy = ExportStrategyFactory::make($format);
            
            return [
                'content' => $strategy->export($note["content_md"], $note["title"]),
                'content_type' => $strategy->contentType(),
                'filename' => $note["title"] . '.' . $strategy->extension(),
            ];
        }
    }
?>