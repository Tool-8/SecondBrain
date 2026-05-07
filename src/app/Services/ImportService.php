<?php
    namespace App\Services;

    use App\Factories\ImportStrategyFactory;
    use App\Repositories\NoteRepositoryInterface;
    use Illuminate\Http\UploadedFile;
    use RuntimeException;
    use App\Models\Note;

    class ImportService {
        public function __construct(private readonly NoteRepositoryInterface $repository, private readonly ImportStrategyFactory $factory)
        { }

        public function handleUpload(UploadedFile $file): Note {
            $extension = $file->getClientOriginalExtension();
            $strategy = $this->factory->make($extension);

            $data = $strategy->parse($file);

            $timestamp = now()->format('d/m/Y, H:i:s');
            $title = $data['title'] . ' - ' . $timestamp;

            if ($this->repository->isTitleUsed($title)) throw new RuntimeException("TITLE_IN_USE");
            return $this->repository->create($title, $data['content']);
        }
    }

?>
