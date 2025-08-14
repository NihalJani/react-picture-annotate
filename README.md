# React Picture Annotate

A simple and powerful React component for creating, editing, and managing bounding box annotations on images, built with Material-UI.

![Screenshot of React Picture Annotate](https://iili.io/Ftrh9bj.png)

## Features

-   Draw, resize, and label bounding boxes.
-   Assign class labels from list fetched from your model.
-   Zoom and pan functionality for precise annotations.
-   Undo/Redo support for annotation history.
-   Built with Material-UI for a clean and responsive design.

## Installation

```bash
npm install react-picture-annotate
```

## Usage

```jsx
import { useState } from 'react';
import { Annotator, Annotation } from 'react-picture-annotate';

const MyComponent = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const classes = ['cat', 'dog', 'person'];
  const imageUrl = '[https://i.imgur.com/3o1fB3M.jpeg](https://i.imgur.com/3o1fB3M.jpeg)'; // Example image URL

  const handleSave = (newAnnotations: Annotation[]) => {
    console.log('Saved annotations:', newAnnotations);
    setAnnotations(newAnnotations);
  };

  return (
    <div style={{ width: '80%', margin: 'auto' }}>
      <Annotator
        imageUrl={imageUrl}
        classes={classes}
        onSave={handleSave}
        onCancel={() => console.log('Annotation cancelled')}
      />
    </div>
  );
};
```

The onSave handler provides the annotation data in a generic pixel-based format. You can easily convert this data into any format you need, such as YOLO, within this function.

```jsx
const handleSave = (annotations: Annotation[]) => {
  // Get image dimensions (you would have these in your app)
  const imageWidth = 1280;
  const imageHeight = 720;
  
  const yoloData = annotations.map(ann => {
    const classId = classes.findIndex(c => c === ann.label); // Convert label string to class index
    const [x, y, w, h] = ann.box;

    // Convert pixel values to normalized YOLO format
    const x_center = (x + w / 2) / imageWidth;
    const y_center = (y + h / 2) / imageHeight;
    const width = w / imageWidth;
    const height = h / imageHeight;

    return `${classId} ${x_center} ${y_center} ${width} ${height}`;
  }).join('\n');

  console.log("Converted to YOLO format:", yoloData);
  // Now, you can save this string to a .txt file.
};
```
## Props

| Prop       | Type                                | Description                                     |
|------------|-------------------------------------|-------------------------------------------------|
| `imageUrl` | `string`                            | The URL of the image to annotate.               |
| `classes`  | `string[]`                          | An array of class names for the dropdown.       |
| `onSave`   | `(annotations: Annotation[]) => void` | Callback function when the save button is clicked. |
| `onCancel` | `() => void`                        | Callback function when the cancel button is clicked. |


## Contributing & Support

Hey, I'm new to this. Found a bug or have a feature request? Please open an issue on the [GitHub repository](https://github.com/NihalJani/react-picture-annotate/issues).

Contributions via Pull Requests are also welcome!