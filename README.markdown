# Javascript class used for sending XMLHttp requests.

A request can be synchronous or asynchronous, requests can be in queue, their response can be cached.
If more of the same name waits for a request, only the last one will be run.
<pre><code>
  HZ.Ajax.addRequest({
  	requestURL: url + "?action=show",
	callBack: 'show',
	postParams: [['id', id]],
  	callbackParams: [['show', 'show']],
	cache: false,
  	name: 'show' + id
  });


</code></pre>


# License

This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License found here:

http://creativecommons.org/license/results-one?license_code=by-nc-sa

To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/3.0/ or 
send a letter to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.