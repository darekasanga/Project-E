# Apply Functionality in Project-E

This document describes the "Apply" functionality pattern used throughout the Project-E application.

## Overview

The "apply" pattern is used in several components of the application to provide a two-step process for user interactions:

1. **Configure/Select** - User sets up parameters or selects source data
2. **Apply** - User explicitly applies those changes to take effect

## Implementations

### 1. Blog Edit - Apply Copy Source (`blog-edit.html`)

**Location**: `/public/blog-edit.html`

**Purpose**: Allows copying text content from existing articles to populate form fields for hero sections, list sections, and pinned article displays.

**How it works**:
1. User selects an article ID from a dropdown (`copySourceSelect`)
2. User clicks the "反映" (Apply) button (`applyCopySource`)
3. The function extracts the title and excerpt from the selected article
4. Populates multiple form fields:
   - `heroTitle` - Hero section title
   - `heroBody` - Hero section body
   - `listTitle` - List section title
   - `listSubtitle` - List section subtitle
   - `pinnedTitle` - Pinned article title
   - `pinnedSubtitle` - Pinned article subtitle

**Code Reference**:
```javascript
function applyCopySource() {
  const idx = parseInt(copySourceSelect.value, 10);
  if (!Number.isInteger(idx)) {
    copySourceStatus.textContent = "記事IDを選択してください。";
    return;
  }
  const { article } = BlogData.findArticle(idx);
  if (!article) {
    copySourceStatus.textContent = "記事が見つかりませんでした。";
    return;
  }

  const title = article.title?.trim() || `記事ID ${idx}`;
  const body = (article.body || "").split(/\n+/)[0].trim();
  const excerpt = body.slice(0, 120);

  const setters = {
    heroTitle: title,
    listTitle: title,
    pinnedTitle: title,
    heroBody: excerpt,
    listSubtitle: excerpt,
    pinnedSubtitle: excerpt,
  };

  Object.entries(setters).forEach(([key, value]) => {
    const input = copyForm.querySelector(`[name="${key}"]`);
    if (input) input.value = value;
  });

  copySourceStatus.textContent = `ID ${idx} の記事から文言を反映しました。`;
}
```

**Event Listener**:
```javascript
applyCopySourceBtn.addEventListener("click", applyCopySource);
```

### 2. Calculator - Apply Settings (`Calcu/index.html`)

**Location**: `/Calcu/index.html` and `/Calcu.html`

**Purpose**: Applies saved settings and UI state for the childcare fee calculator.

**Functions**:
- `applySidebarState()` - Applies the saved sidebar open/closed state
- `applySettingsToInputs()` - Applies saved column visibility settings to the input table
- `applyTimeEdit(inputEl, which)` - Applies time editing validation and formatting

**Code Reference**:
```javascript
function applySidebarState() {
  const savedState = localStorage.getItem("sidebar") === "open";
  if (savedState) sidebar.classList.add("open");
}

function applySettingsToInputs() {
  const data = loadSettings();
  // Apply column visibility based on saved settings
  // ...implementation
}

function applyTimeEdit(inputEl, which) {
  // Validate and format time input
  // Apply calculated values based on time changes
  // ...implementation
}
```

### 3. Blog Theme - Apply Card Theme (`public/blog*.html`)

**Location**: Multiple blog-related HTML files

**Purpose**: Applies visual theming to blog article cards based on images.

**Code Pattern**:
```javascript
function applyCardTheme(el, image) {
  // Apply gradient or solid color theme to card element
  // based on whether an image is provided
}
```

## Design Pattern Benefits

The "apply" pattern provides several advantages:

1. **Explicit User Intent**: Users must explicitly confirm they want to apply changes
2. **Preview/Review**: Users can review selections before applying
3. **Validation**: Apply functions can validate data before committing changes
4. **Error Handling**: Clear feedback when apply operations fail
5. **Undo-friendly**: Explicit application makes it easier to implement undo functionality

## Testing

A test page has been created at `/test-apply.html` to demonstrate and verify the apply pattern:

- Test 1: Basic apply settings functionality
- Test 2: Apply from source (similar to `applyCopySource`)

## Best Practices

When implementing new "apply" functionality:

1. **Validate Input**: Always validate user input before applying
2. **Provide Feedback**: Show success/error messages after apply operations
3. **Handle Edge Cases**: Check for missing data, invalid selections, etc.
4. **Use Descriptive Names**: Name functions clearly (e.g., `applyXxxSettings`, `applyXxxSource`)
5. **Event Listeners**: Attach event listeners in the DOMContentLoaded or initialization phase
6. **State Management**: Consider whether applied changes should be persisted (localStorage, API, etc.)

## Related Files

- `/public/blog-edit.html` - Main implementation of applyCopySource
- `/Calcu/index.html` - Calculator apply functions
- `/Calcu.html` - Duplicate of calculator with apply functions
- `/test-apply.html` - Test and demonstration page
- Various blog files (`blog.html`, `blog-public.html`, `blog-tag.html`, `blog-article.html`) - applyCardTheme implementations

## Future Enhancements

Potential improvements to apply functionality:

1. Add undo/redo capability after apply operations
2. Implement apply confirmations for destructive operations
3. Add animation/transitions when applying changes
4. Create a unified apply event bus for better state management
5. Add analytics tracking for apply operations
