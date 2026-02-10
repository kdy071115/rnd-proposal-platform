"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
    content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
    return (
        <div className="prose prose-slate prose-sm max-w-none p-8 border rounded-md shadow-sm bg-white
            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-6 prose-headings:mb-4
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6
            prose-li:text-gray-700 prose-li:my-1
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-table:border-collapse prose-table:w-full
            prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-th:text-left
            prose-td:border prose-td:border-gray-300 prose-td:p-2
            prose-hr:border-gray-300 prose-hr:my-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
