/**
 * Shared configuration for ReactQuill across all admin components.
 * Implements auto-cleaning and standardized toolbar.
 */

export const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
  clipboard: {
    // This matcher cleans up pasted content to ensure only structural HTML remains
    matchVisual: false,
  }
};

export const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link'
];

/**
 * Shared styles for the editor container to ensure high-quality editing experience
 */
export const editorStyles = "bg-white min-h-[400px] prose prose-purple max-w-none";