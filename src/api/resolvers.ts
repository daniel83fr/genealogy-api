import { searchPerson1 } from "../services/search/providers/MongoDataProvider";

var resolver = {
    getPersons: getPersons(),
    hello: () => "AAAA"
};

export default resolver;

function getPersons() {
    return () => {
        return searchPerson1()
            .then(res => {
                let items: any[] = [];
                res = Object.assign(res);
                res.forEach((element: {
                    _id: any;
                    FirstName: any;
                    LastName: any;
                }) => {
                    items.push({
                        "_id": element._id,
                        "FirstName": element.FirstName,
                        "LastName": element.LastName
                    });
                });
                return items;
            });
    };
}
