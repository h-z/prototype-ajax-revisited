# Javascript class used for sending XMLHttp requests.

A request can be synchronous or asynchronous, requests can be in queue, their response can be cached.
If more of the same name waits for a request, only the last one will be run.
<code>
  Ajax.addRequest({
  	requestURL: url + "?action=show",
  	callBack: 'show',
  	postParams: [['id', id]],
  	callbackParams: [['show', 'show']],
  	cache: false,
  	name: 'show' + id
  });


</code>