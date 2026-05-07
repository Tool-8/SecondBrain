<?php
namespace App\Utilities;

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

        foreach ($xpath->query('//*[@data-ai-retranslate]') as $node) {
            $node->parentNode?->removeChild($node);
        }

        foreach ($xpath->query('//*[@data-ai-parent or @data-ai-child]') as $node) {
            /** @var \DOMElement $node */

            $content = $xpath->query('.//*[@data-ai-content]', $node)->item(0);

            if ($content) {
                $textNode = $dom->createTextNode($content->textContent ?? '');
                $node->parentNode?->replaceChild($textNode, $node);
            } else {
                $textNode = $dom->createTextNode($node->textContent ?? '');
                $node->parentNode?->replaceChild($textNode, $node);
            }
        }

        foreach ($xpath->query('//*[@data-normal-block or @data-ai-label or @data-ai-content]') as $node) {
            /** @var \DOMElement $node */
            $node->removeAttribute('class');
            $node->removeAttribute('data-normal-block');
            $node->removeAttribute('data-ai-label');
            $node->removeAttribute('data-ai-content');
        }

        $text = '';

        foreach ($dom->childNodes as $node) {
            $text .= $this->nodeToText($node);
        }

        return $this->normalizeMarkdownText($text);
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

        if ($node instanceof \DOMElement && in_array(strtolower($node->tagName), ['div', 'p', 'section'])) {
            $text .= "\n";
        }

        return $text;
    }

    private function normalizeMarkdownText(string $text): string
    {
        $lines = preg_split("/\r\n|\r|\n/", $text);

        $lines = array_map(function ($line) {
            return preg_replace('/^[ \t]+/', '', $line);
        }, $lines);

        $text = implode("\n", $lines);

        $text = preg_replace("/\n{3,}/", "\n\n", $text);

        return trim($text);
    }
}
?>