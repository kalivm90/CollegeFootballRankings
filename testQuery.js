// query.js
const query = [
    {
        $project: {
            _id: 0,
            ranks: { $arrayElemAt: ['$polls.ranks', 0] }
        }
    },
    {
      $unwind: '$ranks'
    },
    {
      $replaceRoot: { newRoot: '$ranks' }
    }
]

// load('path/to/testQuery.js')
// db.ranks.aggregate(query)

  