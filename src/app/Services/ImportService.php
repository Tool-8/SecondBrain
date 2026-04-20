<?php
    namespace App\Services;

    use App\Factories\ImportStrategyFactory;
    use App\Repositories\NoteRepositoryInterface;
    use Illuminate\Http\UploadedFile;

    class ImportService {
        public function __construct(private readonly NoteRepositoryInterface $repository, private readonly ImportStrategyFactory $factory)
        { }
    
        public function handleUpload(UploadedFile $file) {
            $extension = $file->getClientOriginalExtension();
            $strategy = $this->factory->make($extension);

            $data = $strategy->parse($file);
            
            $timestamp = now()->format('Y-m-d H:i:s');
            $title = $data['title'] . ' - ' . $timestamp;

            return $this->repository->create($title, $data['content']);
        }
    }

?>