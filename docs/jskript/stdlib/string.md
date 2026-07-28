# Stdlib: String

> Text manipulation functions. Available globally.

---

## `upper of <string>`

Convert to uppercase.

```jskript
upper of "hello"  # "HELLO"
```

## `lower of <string>`

Convert to lowercase.

```jskript
lower of "HELLO"  # "hello"
```

## `trim of <string>`

Remove leading/trailing whitespace.

```jskript
trim of "  text  "  # "text"
```

## `split <string> by <separator>`

Split into a list.

```jskript
split "a,b,c" by ","  # ["a","b","c"]
```

## `join <list> with <separator>`

Join list into string.

```jskript
join ["a","b","c"] with "-"  # "a-b-c"
```

## `length of <string>`

Character count.

```jskript
length of "hello"  # 5
```

## `<string> from <start> to <end>`

Substring (1-indexed, inclusive).

```jskript
"hello" from 1 to 3  # "ell"
"hello" from 2 to -1 # "ello"
```

## `contains <string>`

Check if string contains substring.

```jskript
"hello world" contains "world"  # true
```

## `starts with <prefix>`

Check prefix.

```jskript
"hello" starts with "he"  # true
```

## `ends with <suffix>`

Check suffix.

```jskript
"hello" ends with "lo"  # true
```

## `replace <string> from <old> to <new>`

String replacement.

```jskript
replace "hello world" from "world" to "jSkid"  # "hello jSkid"