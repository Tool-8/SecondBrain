<?php
    namespace App\Services;

    class EditorContentFormatter {

        public function htmlToMarkdown(string $html): string
        {
            $dom = new \DOMDocument();

            libxml_use_internal_errors(true);
            $dom->loadHTML(
                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $html,
                LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
            );
            libxml_clear_errors();

            $xpath = new \DOMXPath($dom);

            foreach ($xpath->query('//*[@hidden]') as $node) {
                $node->parentNode?->removeChild($node);
            }

            foreach ($xpath->query('//*[@data-ai-parent or @data-ai-child or @data-normal-block or @data-ai-label]') as $node) {
                /** @var \DOMElement $node */
                $node->removeAttribute('class');
                $node->removeAttribute('data-ai-parent');
                $node->removeAttribute('data-ai-child');
                $node->removeAttribute('data-normal-block');
                $node->removeAttribute('data-ai-label');
            }

            $text = '';

            foreach ($dom->childNodes as $node) {
                $text .= $this->nodeToText($node);
            }

            return trim($text);
        }

        private function nodeToText(\DOMNode $node): string
        {
            if ($node instanceof \DOMText) {
                return $node->nodeValue;
            }

            if ($node instanceof \DOMElement && strtolower($node->tagName) === 'br') {
                return "\n";
            }

            $text = '';

            foreach ($node->childNodes as $child) {
                $text .= $this->nodeToText($child);
            }

            if ($node instanceof \DOMElement && in_array(strtolower($node->tagName), ['div', 'p'])) {
                $text .= "\n";
            }

            return $text;
        }
    }
?>