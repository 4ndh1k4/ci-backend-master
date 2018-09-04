
   <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>        
        <small></small>
      </h1>
      <ol class="breadcrumb">
        <li><?php echo anchor('dashboard','<i class="fa fa-dashboard"></i> Beranda</a>')?></li>
      </ol>
    </section>
<!-- Main content -->
    <section class="content">
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div>';
    }  ?>
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title">Daftar menu </h3><hr />	
			<div class="box-tools pull-right">            
                <?php echo anchor(site_url('menu/create'), '<i class = "fa fa-plus"></i> Tambah Data', 'class="btn btn-flat btn-info"'); ?>
	   
			</div>
		</div>
            <div class="box-body">
        <table class="table table-bordered table-striped" id="myTable">
            <thead>
                <tr>
                    <th width="80px">No</th>
			    	<th>Parent Menu</th>
			    	<th>Nama Menu</th>
			    	<th>Controller Link</th>
			    	<th>Icon</th>
			    	<th>Slug</th>
			    	<th>Urut Menu</th>
			    	<th>Menu Users</th>
			    	<th>Is Active</th>
			    	<th width="200px">Aksi</th>
                </tr>
            </thead>
	    
        </table>
        <script src="<?php echo base_url('resources/js/jquery-1.11.2.min.js') ?>"></script>
        <script type="text/javascript">
            $(document).ready(function() {
                $.fn.dataTableExt.oApi.fnPagingInfo = function(oSettings)
                {
                    return {
                        "iStart": oSettings._iDisplayStart,
                        "iEnd": oSettings.fnDisplayEnd(),
                        "iLength": oSettings._iDisplayLength,
                        "iTotal": oSettings.fnRecordsTotal(),
                        "iFilteredTotal": oSettings.fnRecordsDisplay(),
                        "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
                        "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
                    };
                };

                var t = $("#myTable").dataTable({
                    initComplete: function() {
                        var api = this.api();
                        $('#mytable_filter input')
                                .off('.DT')
                                .on('keyup.DT', function(e) {
                                    if (e.keyCode == 13) {
                                        api.search(this.value).draw();
                            }
                        });
                    },
                    oLanguage: {
                        sProcessing: "loading..."
                    },
					"scrollX": true,
                    processing: true,
                    serverSide: true,
                    ajax: {"url": "menu/json", "type": "POST"},
                    columns: [
                        {
                            "data": "id",
                            "orderable": false
                        },{"data": "parent_menu"},{"data": "nama_menu"},{"data": "controller_link"},{"data": "icon"},{"data": "slug"},{"data": "urut_menu"},{"data": "menu_grup_user"},{"data": "is_active"},
                        {
                            "data" : "action",
                            "orderable": false,
                            "className" : "text-center"
                        }
                    ],
                    order: [[0, 'desc']],
                    rowCallback: function(row, data, iDisplayIndex) {
                        var info = this.fnPagingInfo();
                        var page = info.iPage;
                        var length = info.iLength;
                        var index = page * length + (iDisplayIndex + 1);
                        $('td:eq(0)', row).html(index);
                    }
                });
            });
        </script>
			</div>
          
        
    </section>
   <!-- /.content -->
  
	
