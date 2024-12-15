import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const DraftEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  // Load saved content from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("draftContent");
    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  // Handle editor changes
  const onChange = (state) => {
    setEditorState(state);
    handleSpecialInput(state);
  };

  // Detect special input patterns
  const handleSpecialInput = (state) => {
    const contentState = state.getCurrentContent();
    const selectionState = state.getSelection();
    const blockKey = selectionState.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();

    let newContentState = contentState;

    // Detect # -> Heading
    if (blockText.startsWith("# ") && blockText.length > 2) {
      newContentState = applyBlockType(contentState, blockKey, "header-one", 2);
    }
    // Detect * -> Bold
    else if (blockText.startsWith("* ") && blockText.length > 2) {
      newContentState = applyInlineStyle(contentState, blockKey, "BOLD", 2);
    }
    // Detect ** -> Red line
    else if (blockText.startsWith("** ") && blockText.length > 3) {
      newContentState = applyInlineStyle(contentState, blockKey, "redLine", 3);
    }
    // Detect *** -> Underline
    else if (blockText.startsWith("*** ") && blockText.length > 4) {
      newContentState = applyInlineStyle(
        contentState,
        blockKey,
        "UNDERLINE",
        4
      );
    }

    // If content changed, update editor state
    if (newContentState !== contentState) {
      const newEditorState = EditorState.push(
        state,
        newContentState,
        "change-inline-style"
      );
      setEditorState(newEditorState);
    }
  };

  // Apply block type (like heading)
  const applyBlockType = (contentState, blockKey, blockType, offset) => {
    const updatedContent = Modifier.replaceText(
      contentState,
      contentState
        .getSelectionAfter()
        .merge({ anchorOffset: 0, focusOffset: offset }),
      ""
    );
    return Modifier.setBlockType(
      updatedContent,
      updatedContent.getSelectionAfter(),
      blockType
    );
  };

  // Apply inline style (like bold, underline)
  const applyInlineStyle = (contentState, blockKey, style, offset) => {
    const blockText = contentState.getBlockForKey(blockKey).getText();
    const updatedContent = Modifier.replaceText(
      contentState,
      contentState
        .getSelectionAfter()
        .merge({ anchorOffset: 0, focusOffset: offset }),
      ""
    );

    return Modifier.applyInlineStyle(
      updatedContent,
      updatedContent.getSelectionAfter().merge({
        anchorOffset: 0,
        focusOffset: blockText.length - offset,
      }),
      style
    );
  };

  // Save content to localStorage
  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem("draftContent", JSON.stringify(rawContent));
    alert("Content saved!");
  };

  // Add custom inline styles (for red text)
  const styleMap = {
    redLine: {
      color: "red",
    },
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd" }}>
      <h2>Demo Editor</h2>
      <div
        style={{
          border: "1px solid #ccc",
          minHeight: "200px",
          padding: "10px",
          cursor: "text",
        }}
      >
        <Editor
          editorState={editorState}
          onChange={onChange}
          customStyleMap={styleMap}
          placeholder="Start typing..."
        />
      </div>
      <button style={{ marginTop: "10px" }} onClick={handleSave}>
        Save
      </button>
    </div>
  );
};

export default DraftEditor;
