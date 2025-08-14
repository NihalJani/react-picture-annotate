# React Picture Annotate
(UNDER CONSTRUCTION)
A powerful and simple React component for creating bounding box annotations on images.

## Installation

```bash
npm install react-picture-annotate
```

## Usage

```jsx
import { Annotator, Annotation } from 'react-picture-annotate';
import 'react-picture-annotate/dist/style.css'; // Don't forget to import the styles!

const MyComponent = () => {
  const classes = ['cat', 'dog', 'person'];
  const imageUrl = '[https://example.com/my-image.jpg](https://example.com/my-image.jpg)';

  const handleSave = (annotations: Annotation[]) => {
    console.log('Saved annotations:', annotations);
  };

  return (
    <Annotator
      imageUrl={imageUrl}
      classes={classes}
      onSave={handleSave}
      onCancel={() => console.log('Cancelled')}
    />
  );
};
```

## Props

| Prop       | Type                                | Description                                     |
|------------|-------------------------------------|-------------------------------------------------|
| `imageUrl` | `string`                            | The URL of the image to annotate.               |
| `classes`  | `string[]`                          | An array of class names for the dropdown.       |
| `onSave`   | `(annotations: Annotation[]) => void` | Callback function when the save button is clicked. |
| `onCancel` | `() => void`                        | Callback function when the cancel button is clicked. |