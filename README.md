# BookWorm

## 1. Introduction

### 1.1 Motivation

We see potential in developing a system that recommends or assists a user in searching a book based on a user's taste. We realized that a spoken dialogue system would be of significant use in this scenario as it would eliminate the need to browse the internet to compare books on different platforms. Primarily the motivation behind our systems emanates from the following ideas:

1. Tired of searching a good book online on New York Times, Goodreads, Amazon books and other platforms?

2. People who are avid readers want to stay updated on the latest books available in the market. In research, we found that more than 3,00,000 books and editions are released in the US each year. What's a good way to keep up with so much content?

3. Visually impaired people have limited sources for searching books online. Can this issue be addressed?

We envision a spoken dialog system which saves time and provides best suggestions based on user queries and interests. The system will be able to track hot favorites in each category for the week. It will also help visually impaired people for easy searching through an open dialog to find their favorite content.

### 1.2 Description of System (or Description of Data if research project)

We intend to create a dialog system using Alexa that will give users recommendations on books based on genre, author, and title. We plan to achieve this by querying the best available books API's like NY Times Bestsellers, Goodreads, etc.

A user can directly lookup a book and get more information about that or add that to their reading list. A user can also get suggestions for any book based on a genre.

The system will support following user actions:

a. Search Book by title

b. Search books by author name

c. Search books by genre

d. Summary of a book

e. Ratings for a book

f. Read reviews

g. Suggest a book based on dialog

h. Find bestsellers

Alexa will handle the Speech to text recognition. A Node.js server will run in the backend to query different API's and parse the text to extract the most relevant data using our algorithm. The result will be returned to the user. The user preferences and reading list will be stored in a database on user's consent.

### 1.3 Example Dialogue (either with your system or from your corpus)

User: Hey Alexa, open Bookworm

System: Hey! Which book would you like to read today. To know about other options, say “Help”.

User: Suggest me a fiction

System: Hmm Interesting choice! The top three New York Times best seller in this genre are 1. ORIGIN 2. THE SUN AND HER FLOWERS 3. SLEEPING BEAUTIES. To get a list of more books say “more”.

User: Who is the author of SLEEPING BEAUTIES?

System: This book is written by STEPHEN KING. Would you like to know more about the book?

User: Yes! Please tell me about the user ratings?

System: SLEEPING BEAUTIES has 3.92 out of 5 stars rating on Goodreads. Would you also like me to read a review?

User: Sure

System: Melisa has given it 5 stars and says “I loved the tree and animals and that's all I'm saying!”. Are you interested in listening a summary?

User: No, That does not sound interesting. Go back

System: Cool! Here are your other 3 choices: 1. ORIGIN 2. IT 3. THE SUN AND HER FLOWERS , If you are not interested in these choices say “more”

User: Give me more options

System: Ok. Here are your other choices: 1. A COLUMN OF FIRE 2. A CUBAN AFFAIR 3. SECOND CHANCE GIRL. Which one would you like to know more about?

User: Umm! Not interested. Go back

System: Okay. Tell me which kind of book would you like ?

User: Give me books written by author “DAN BROWN”

System: Sure! Here are some of best sellers from “DAN BROWN” : 1. ANGELS AND DEMONS 2. THE DA VINCI CODE 3. DECEPTION POINT

User: Hmm! I found a book. Add DECEPTION POINT to “my reading list”.

System: Done! Added book to your reading list. I hope you like your book.