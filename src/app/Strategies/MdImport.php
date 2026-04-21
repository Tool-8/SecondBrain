<?php
    namespace App\Strategies;

    use App\Strategies\ImportStrategyInterface;
    use Illuminate\Http\UploadedFile;

    class MdImport implements ImportStrategyInterface {
        public function parse(UploadedFile $file): array {
            return [
                'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'content' => file_get_contents($file->getRealPath()),
            ];
        }
    }
?>