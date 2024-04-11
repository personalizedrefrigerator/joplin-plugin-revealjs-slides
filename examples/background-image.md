<!-- Shows how to use Joplin resources as background images -->

<section data-background-image="title(background-1)">

![](:/e59ca325dba14963a8e63bdf5afba435 "background-1")

### Using Joplin Resources as background images

1. Include the target image somewhere in the document.
2. Give the image a title ([syntax](https://spec.commonmark.org/0.31.2/#example-572))
   - Example: `![](:/resourceidhere "title-here")`
3. Add `data-background-image="title(background-1)"` to the section for the slide


</section>

---

### Note

```markdown
<section>

Slide 1

</section>

---

<section>

Slide 2

</section>
```
is equivalent to
```markdown
Slide 1

---

Slide 2
```

---

This means that options can be added to slides by wrapping that slide's content in a single `<section>...</section>`. 

---

### Note

Other background options can be found [here](https://revealjs.com/backgrounds/).